import { MongoClient } from 'mongodb';

export async function mdbConnect(uri: string) {
	try {
        const client = new MongoClient(uri);
		await client.connect();
		const db = client.db("train_catcher");
        return { client, db, error: null };
	} catch (e) {
        return { client: null, db: null, error: e };
    }
}