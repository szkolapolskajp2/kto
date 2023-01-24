const CryptoJS = require("crypto-js");
const fs = require("fs");
const passwords = require("./hasla.json");
const data = fs.readFileSync("./data.unencrypted", "utf8").trim().split("\n");

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

for (const line of data) {
  if (!line.trim()) continue;
  const [grade, ...rest] = line.split("\t").map((a) => a.trim());
  if (parsed[grade]) {
    const el = {
      grade,
      studentName: rest[0],
      studentLastInitial: rest[1][0] || "",
      parentName: rest[3],
      parentNum: rest[5],
      parentEmail: rest[6],
      classMother: rest[10] === "t",
    };
    parsed[grade].push(el);
    el.classMother && parsed.classMothers.push(el);
  } else {
    parsed.directors.push({
      name: [rest[3], rest[4]].join(" "),
      number: rest[5],
      email: rest[6],
    });
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
