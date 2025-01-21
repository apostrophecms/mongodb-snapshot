# @apostrophecms/mongodb-snapshot

A simple nodejs utility library to create and restore snapshots of mongodb databases without the need for `mongodump` and `mongorestore` to be installed. This reduces unnecessary dependencies, especially when relying on MongoDB Atlas for MongoDB hosting.

Because the format of mongodb archive files is a bit more complicated and apparently undocumented, and the BSON format has no readily available streaming support in JavaScript, this module **does not** read and write mongodump files. Instead it reads and writes a simple format based on EJSON (Extended JSON).

## Installation
```bash
npm install @apostrophecms/db-snapshot
```

## Usage

```javascript
// Note: ESM import syntax also works.

// writing

const { MongoClient } = require('mongodb');
const { write } = require('@apostrophecms/db-snapshot');

async function saveASnapshot() {
  const client = new MongoClient(yourMongodbUriGoesHere, { useUnifiedTopology: true });
  await client.connect();
  const db = await client.db();
  // Writes the contents of db to myfilename.snapshot, including indexes
  await write(db, 'myfilename.snapshot');
}
```

```javascript
const { MongoClient } = require('mongodb');
const { erase, read } = require('@apostrophecms/db-snapshot');

async function saveASnapshot() {
  const client = new MongoClient(yourMongodbUriGoesHere, { useUnifiedTopology: true });
  await client.connect();
  const db = await client.db();
  // If you want to replace the current contents and avoid unique key errors and/or duplicate
  // documents, call erase first
  await erase(db);
  await read(db, 'myfilename.snapshot');
```

## Limitations

Correctness comes before performance, for now. Sensible amounts of parallelism would help.

## Credits

This module was [originally created for use with ApostropheCMS](https://apostrophecms.com), an open-source Node.js CMS with robust support for in-context, on-page editing, multitenant, multisite projects and lots of other great features worth checking out.
