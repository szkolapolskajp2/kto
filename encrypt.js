const CryptoJS = require("crypto-js");
const fs = require("fs");
const passwords = require("./unencrypted/hasla.json");
const students = fs
  .readFileSync("./unencrypted/students.unencrypted", "utf8")
  .trim()
  .split("\n");
const mothers = fs
  .readFileSync("./unencrypted/mothers.unencrypted", "utf8")
  .trim()
  .split("\n");
const directors = fs
  .readFileSync("./unencrypted/directors.unencrypted", "utf8")
  .trim()
  .split("\n");

const encryptWithAES = (text, passphrase) =>
  CryptoJS.AES.encrypt(text, passphrase).toString();

const encrypted = {};
const parsed = {
  classMothers: [],
  directors: [],
  "-1": [],
  0: [],
  1: [],
  2: [],
  3: [],
  4: [],
  5: [],
  6: [],
  7: [],
  8: [],
  9: [],
  10: [],
  11: [],
};

for (const director of directors) {
  const [fname, lname, email, number] = director
    .split(/\s+/)
    .map((a) => a.trim());
  parsed.directors.push({
    name: [fname, lname].join(" "),
    email,
    number,
  });
}
for (const mother of mothers) {
  const [grade, fname, lname, parentEmail, parentNum] = mother
    .split(/\s+/)
    .map((a) => a.trim());
  parsed.classMothers.push({
    grade,
    parentName: [fname, lname].join(" "),
    parentNum,
    parentEmail,
  });
}

for (const student of students) {
  if (!student.trim()) continue;
  const [fname, lname, ...rest] = student.split("\t").map((a) => a.trim());
  const grade = rest[6];
  const parentName = [rest[8], rest[9]].join(" ");
  const parentNum = rest[11];
  const parentEmail = rest[12];
  try {
    parsed[grade].push({
      grade,
      studentName: fname,
      studentLastInitial: lname[0] || "",
      parentName,
      parentNum,
      parentEmail,
    });
  } catch (e) {
    console.log({
      fname,
      lname,
      grade,
      parentName,
      parentNum,
      parentEmail,
    });
    throw e;
  }
}

for (const [grade, password] of Object.entries(passwords)) {
  encrypted[grade] = encryptWithAES(
    JSON.stringify({
      parents: parsed[grade].sort((a, b) =>
        a.studentName.localeCompare(b.studentName)
      ),
      classMothers: parsed.classMothers.sort(
        (a, b) => Number(a.grade) - Number(b.grade)
      ),
      directors: parsed.directors,
    }),
    password
  );
}

fs.writeFileSync("./encrypted.json", JSON.stringify(encrypted), { flag: "w" });
