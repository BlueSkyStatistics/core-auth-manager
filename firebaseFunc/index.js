/* eslint-disable */
const functions = require("firebase-functions");

const firebaseAdmin = require("firebase-admin");
const serviceAccount = require('./firebaseAdmin.json')
// Initialize Firebase Admin SDK
const admin = firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount)
});


exports.getToken = functions.https.onRequest(async (request, response) => {
  const {uid} = await request.body;
  functions.logger.info(`Token requested for uid [${uid}]`, {structuredData: true});
  if (uid === undefined) {
    response.sendStatus(403);
  }

  try {
    const user = await admin.auth().getUser(uid);
    const token = await admin.auth().createCustomToken(user.uid);
    response.send({token});
    return
  } catch (e) {
    functions.logger.info(`Error getting token for user ${uid}: ${e}`, {structuredData: true});
  }

  response.sendStatus(403);
});
