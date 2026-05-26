const admin = require("firebase-admin");

// سحب المفتاح السري بشكل آمن ومموه من GitHub Secrets
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://expiretwaiq-default-rtdb.firebaseio.com" // رابط قاعدة بياناتك
});

const db = admin.database();
const ref = db.ref("Activations");

async function runCronJob() {
  const snapshot = await ref.once("value");
  const data = snapshot.val();
  
  if (!data) return console.log("No data found.");

  const now = Date.now();
  const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
  const updates = {};

  for (const [key, value] of Object.entries(data)) {
    // تخطي السجلات التي لا تحتوي على وقت أو التي تم تصفيرها مسبقاً
    if (!value || typeof value.time !== "number" || value.time === 0) continue;

    let expireTime = value.time;
    
    // إذا كانت الحالة false، نضيف 30 يوم
    if (value.exact === false) {
      expireTime += thirtyDaysInMs;
    }

    // المقارنة مع الوقت الحالي
    if (now >= expireTime) {
      updates[`${key}/time`] = 0; // تحويل الوقت إلى صفر
    }
  }

  // تحديث قاعدة البيانات دفعة واحدة إذا كان هناك تعديلات
  if (Object.keys(updates).length > 0) {
    await ref.update(updates);
    console.log(`Updated ${Object.keys(updates).length} records successfully.`);
  } else {
    console.log("All records are valid. No updates needed.");
  }
}

runCronJob()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error updating database:", error);
    process.exit(1);
  });
