import { MongoClient } from 'mongodb';

const { MONGODB_URI, MONGODB_DB } = process.env;



/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongo;

if (!cached) {
  cached = global.mongo = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true
    };

    const mongoURL =
      process.env.NODE_ENV === 'development' ? process.env.LOCAL_MONGODB : process.env.MONGODB_URI;

    cached.promise = MongoClient.connect(mongoURL, opts).then((client) => {
      return {
        client,
        db: client.db(MONGODB_DB)
      };
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
