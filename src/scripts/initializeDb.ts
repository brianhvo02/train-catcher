import { mdbConnect } from "../common/mongodb";
import GtfsRealtimeBindings from 'gtfs-realtime-bindings';
import dotenv from 'dotenv';
import axios from 'axios';
import { createWriteStream } from "fs";
import { readFile, readdir, unlink } from 'fs/promises';
import AdmZip from 'adm-zip';
import { join } from "path";
import tmp from 'tmp';

const supportedAgencies = [
    {
        gtfsId: 'BA',
        oneStopId: 'o-9q9-bart',
        longName: 'Bay Area Rapid Transit',
        shortName: 'BART',
    },
    {
        gtfsId: 'SC',
        oneStopId: 'o-9q9-vta',
        longName: 'Santa Clara Valley Transportation Authority',
        shortName: 'VTA',
    },
];

(async () => {
    dotenv.config({ path: '.env.local' });
    if (!process.env.NEXT_PUBLIC_BA_API_KEY) return console.error('No Bay Area 511 API key in .env.local');
    if (!process.env.MONGODB_URI) return console.error('No MongoDB URI in .env.local');
    const { client, db, error } = await mdbConnect(process.env.MONGODB_URI);
    if (!client || !db || error) return console.error(error);
    console.log("Connected successfully to server");
    await db.dropDatabase();
    const session = client.startSession();
    session.startTransaction();
    await db
        .collection('supportedAgencies')
        .insertMany(supportedAgencies, { session });
    await Promise.all(supportedAgencies.map(async (agency) => {
        const tmpFile = tmp.fileSync();
        const tmpDir = tmp.dirSync();
        const writer = createWriteStream(tmpFile.name);
        await axios.get(`https://api.511.org/transit/datafeeds?api_key=${process.env.NEXT_PUBLIC_BA_API_KEY}&operator_id=${agency.gtfsId}`, { responseType: "stream" }).then(res => {
            return new Promise(resolve => {
                res.data.pipe(writer);
                writer.on('close', () => resolve(true));
            });
        });
    
        const zip = new AdmZip(tmpFile.name);
        zip.extractAllTo(tmpDir.name);
        tmpFile.removeCallback();
        const files = await readdir(tmpDir.name);
        await Promise.all(files.map(async file => {
            const data = await readFile(join(tmpDir.name, file));
            const csv = data.toString('utf-8').split('\r\n');
            if (csv.length < 2) return;
            const headers = csv[0].split(',').concat('agency_id');
            const entries = csv.slice(1).map(row => Object.fromEntries(row.split(',').concat(agency.gtfsId).map((el, i) => [headers[i], el])));
            await db.collection(file.substring(0, file.indexOf('.'))).insertMany(entries, { session });
        }));
        await Promise.all(files.map(async file => await unlink(join(tmpDir.name, file))));
    
        tmpDir.removeCallback();
    }));
    
    await session.commitTransaction();
    await client.close();
})();