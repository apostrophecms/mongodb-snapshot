"use strict";

const uri = 'mongodb://localhost:27017/db-snapshot-test-only';

const { MongoClient } = require('mongodb');

const assert = require('assert');

const { read, write, erase } = require('../index.js');


let client, db;

describe('test db-snapshot', function() {
  before(async function() {
    await connect();
    await erase(db);
  });
  after(async function() {
    await close();
  });
  it('can write a snapshot', async function() {
    const docs = db.collection('docs');
    await docs.insertOne({
      tull: '35 cents please'
    });
    await docs.insertOne({
      tull: 'jethro'
    });
    // Test whether indexes are included in shapshots
    await docs.createIndex({
      tull: 1
    }, {
      unique: true
    });
    await write(db, `${__dirname}/test.snapshot`);
  });
  it('can read a snapshot', async function() {
    const docs = db.collection('docs');
    await docs.deleteMany({});
    await docs.dropIndexes();
    await read(db, `${__dirname}/test.snapshot`);
    const result = await docs.find({}).sort({ tull: 1 }).toArray();
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0].tull, '35 cents please');
    assert.strictEqual(result[1].tull, 'jethro');
    assert.rejects(async function() {
      // Should be blocked by the index if it was restored properly
      return docs.insertOne({
        tull: 'jethro'
      });
    });
  });
});

async function connect() {
  client = new MongoClient(uri, { useUnifiedTopology: true });
  await client.connect();
  db = await client.db();
  return db;
}

async function close() {
  await client.close();
}
