// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { mdbConnect } from '@/common/mongodb';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (!process.env.MONGODB_URI) return res.status(500).send('No MongoDB URI in .env.local');
    const { client, db, error } = await mdbConnect(process.env.MONGODB_URI);
    if (!client || !db || error) return res.status(500).send('Error connecting to database');
    const route = await db.collection('routes').findOne({ route_id: req.query.route_id })
    res.status(200).json(route);
    client.close();
}
