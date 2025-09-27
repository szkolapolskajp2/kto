let encrytpedFile;
// prettier-ignore

const query = new URLSearchParams(window.location.search)
if(query.size===2){
  localStorage.setItem(query.get('k'), query.get('h'));
  localStorage.setItem('lastSelected', query.get('k'));
}

const letterMap = {ą: "a",  ć: "c",  ę: "e",  ł: "l",  ń: "n",  ó: "o",  ś: "s",  ź: "z",  ż: "z"};
const print = () => {
  $$('div div > *:not(:first-child)').forEach(a => a.remove())
  window.print()
}

const decrypt = (text, passphrase) =>
  CryptoJS.AES.decrypt(
    text,
    passphrase
      .toLowerCase()
      .split("")
      .map((letter) => letterMap[letter] || letter)
      .join("")
  ).toString(CryptoJS.enc.Utf8);

const app = Vue.createApp({
  data() {
    const lastSelected = localStorage.getItem('lastSelected');
    return {
      klasa: lastSelected || '',
      haslo: localStorage.getItem(lastSelected) || '',
      data: null,
      dupKidNames: [],
    };
  },
  methods: {
    async fetchClass() {
      const res =
        encrytpedFile ||
        (await fetch("encrypted.json").then((res) => res.json()));
      encrytpedFile = res;

      try {
        this.data = JSON.parse(decrypt(res[this.klasa], this.haslo));
        this.dupKidNames = this.data.parents.map(a => a.studentName).filter((e, i, a) => a.indexOf(e) !== i)
        console.log(this.dupKidNames)
        localStorage.setItem(this.klasa, this.haslo);
        localStorage.setItem('lastSelected', this.klasa);
        // console.log(JSON.parse(decrypt(res[this.klasa], this.haslo)));
      } catch (e) {
        console.error("zle haslo", e);
        this.data = null;
      }
    },
    onClassChange() {
      this.haslo = localStorage.getItem(this.klasa);
      this.fetchClass();
    },

    copyArrayToClipboard(arr) {
      const filtered = arr.map(p => p.parentEmail).filter( (a, index, self) => (a && self.indexOf(a) === index) );
      this.copyToClipboard(filtered.join(';'));
    },

    copyToClipboard(str) {
      if (!str) return;
      let fakeElem = document.createElement("textarea");
      fakeElem.style.fontSize = "12pt";
      fakeElem.style.border = "0";
      fakeElem.style.padding = "0";
      fakeElem.style.margin = "0";
      fakeElem.style.position = "absolute";
      fakeElem.style["left"] = "-9999px";
      fakeElem.style.top =
        (window.pageYOffset || document.documentElement.scrollTop) + "px";
      fakeElem.setAttribute("readonly", "");
      fakeElem.value = str;
      document.body.appendChild(fakeElem);
      fakeElem.select();
      try {
        document.execCommand("copy");
        postToast();
      } catch (err) {}

      document.body.removeChild(fakeElem);
    },
  },
});

app.mount("#app").fetchClass();

var postToast = () => {
  const Toaster = document.getElementById("toaster");
  const toast = document.createElement("li");
  toast.classList.add("toast");
  toast.innerHTML = "Copied!";
  Toaster.append(toast);
  setTimeout(() => Toaster.removeChild(toast), 700);
};
