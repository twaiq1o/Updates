const admin = require('firebase-admin');

// مفتاح الاتصال المباشر الخاص بمشروعك دون تمويه
const serviceAccount = {
  "type": "service_account",
  "project_id": "expiretwaiq",
  "private_key_id": "3160000d372c7acfdcf920086a22aac21be74433",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDfCRsCvEznXby8\nvTeqxFR1zEjIgJJ2z5LZrMPqv67mTZ2MxX4YTRNLe+dTA220IFiKeXenEEgMkBuv\nlKGqlI3XBQmgTICwdyVSTWJNiZtZtIw/Wzil/Vf2btYOXJQRQ5G6i/YUMiyemO5p\nfhe89hImi755lMWXxMBT1RnGb3+4pDx8B+dAX+gFQYNQBzJPi4L3UlPOAWBvLVEk\n0Hl0KIpb0iAFkOq1VFz1n5I8sat5g9dgL7g27ZuMcUrPGggMAeYVioj0rmqzNxyx\n2FAVpc/BVhiblvFE8rHvpC0ky6imBhuGJdoaxnV91qFHFYaM1j6Y+F4ggVn5NB6K\nc4TEd8W1AgMBAAECggEAKxh4EOMADBurbp+0LCmz9TAEJ0PaqRzqL+fHUmp32dXI\n+cymVP09m3IFTF/G+I1gdl9KnKwTc+P7iYVzaIG8V34IcmId4psfCcRcmIVckGyH\xe0zKLWnY71eXJeMX7qZ470MDzJztzBvLtCXtyIn9y084IK73Fu+2uP8D0D3oZ40\nGT109uqk1ua1c8lKNvzwK3UENXM229GmraU6Fl5a1ei6bBPEYtYVR2rGEKyc29dD\nVQl0sVTNa1z7smnLcm15/ZCtYzThX/mkrjne8I3coq+MGU/fEmYcjuOn/1YinLA2\nE8sxvfdWbMKd+KTWcpJRR0GmZE6YIWZJHglH2bsVaQKBgQD0SANVmcj86XQ4sUCW\nagkTYHR5h6u+p229wgkSgATsKd5/lnpQnvzdBbF8hUF8ja4wl6XaZHBPQrlNSTf1\nC5YlGpRIUK3TnOfTYwNsgYXbdIkL66qBFzqluflntfEImrR1Rwl1/jw4zV1ukaYY\nhrMwuDWpMdQE2TV4XF7aICHtuQKBgQDpvC0ok2CJi52TGs5aBvlWie3/LgBGGu1C\nQ2P1yalWZIp2Jq5RikaoUt2vWp+Az+IukWnyJMIrNMrGWcHAb2IGy5zadM180w+W\ndGrINStY44HlXWrv3gtHGpQQ38hoFHCetf7etUKO92Z9Eq9yZw6dJF6LL+ynwLvR\n4BmCtch13QKBgQDvHm7lJBxyNbPmqtumYTVxGkHplLyxbAModP+cdGRdKL779bjV\nokuzrxcF5QsteSLBvjBDj33AmHf7B2kXHbhjqZjtEMyXEEh9y7ZWSJNXNsPQP2gv\n5SUrhNh2hMrkuUtcYaUJM0yP7bc/vKLx7ykIz8j3TidUd6q3nvPaYQnVQQKBgQCq\nGi/HOtJj536rAzQv4qltKH5TWtgKLSiEM+U4iCW74Pm/mND+OKLJd10sc8hnB2N1\nPpCbD9NbfFUiW0odUTJG/cHOXnj5oeTTOzBHOiKs0w3CreTYYoFUouwlB6eiz1VS\nu+Kbk9C3mSc2WPXkTUoeZMyFgUA6qZJG4E/Qh5k25QKBgQCuxshRbhstJLBPNCND\nOQ9E7GoUEZZN5HaQKRMhU4EQSS11ptIjp9fnWW0xxp8Y/N1ky+T3icAxM3nwqJ2D\np+RUZ93hLv3Mzrqh4Fyf8m+z5MD38eLYJorKNign0xKEC2gxhjgp4SWTeN8qR3Ap\nnICU3iDu5p5WWCyv1kV+aFqG2Q==\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@expiretwaiq.iam.gserviceaccount.com",
  "client_id": "100228184482635252309",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40expiretwaiq.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

// الاتصال بقاعدة البيانات الخاصة بك
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://expiretwaiq-default-rtdb.firebaseio.com/"
});

const db = admin.database();
const ref = db.ref("Activations");

async function runInventory() {
  try {
    const snapshot = await ref.once("value");
    if (!snapshot.exists()) {
      console.log("لا توجد بيانات في قسم Activations.");
      process.exit(0);
    }

    const currentTime = Date.now();
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000; // مدة 30 يوم
    const updates = {};

    snapshot.forEach((child) => {
      const key = child.key;
      const data = child.val();

      // تخطي الحساب إذا كان الوقت مصفراً أو فارغاً
      if (data.time === 0 || !data.time) return;

      let expirationTime = data.time;

      // الشرط الأول: إذا كان exact يساوي false يتم إضافة 30 يوم للوقت
      if (data.exact === false || data.exact === "false") {
        expirationTime += thirtyDaysInMs;
      }

      // الشرط الثاني والمقارنة: إذا انتهى الوقت، يتم تحويله إلى صفر
      if (currentTime > expirationTime) {
        updates[`${key}/time`] = 0;
        console.log(`تم تصفير الحساب المنتهي: ${key}`);
      }
    });

    // حفظ التعديلات في فايربيس
    if (Object.keys(updates).length > 0) {
      await ref.update(updates);
      console.log("تم تحديث قاعدة البيانات بنجاح.");
    } else {
      console.log("الفحص مكتمل: لا توجد حسابات منتهية حالياً.");
    }
    process.exit(0);
  } catch (error) {
    console.error("حدث خطأ أثناء تشغيل الفحص والاتصال:", error);
    process.exit(1);
  }
}

runInventory();
