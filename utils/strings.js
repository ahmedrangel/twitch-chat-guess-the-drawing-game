import es from "~/strings/es.js";
import en from "~/strings/en.js";

import o_es from "~/strings/game.es.js";
import o_en from "~/strings/game.en.js";


const locales = { es, en };
const obj = { o_es, o_en };

class Locale {
  constructor (code) {
    this.code = String(code).toLowerCase();
  }

  get (key) {
    return locales[this.code][key] || locales.en[key] || key;
  }

  getCategoryObjects () {
    return obj[`o_${this.code}`] || obj.o_en;
  }

  getRandomObject (type, options) {
    if(type === "games") {
      const { game } = options;
      const keys = Object.keys(obj[`o_${this.code}`][type]["game_type"][game]["words"] || obj.o_es);
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      return obj[`o_${this.code}`][type]["game_type"][game]["words"][randomKey] || obj.o_es[type]["game_type"][game]["words"][randomKey] || randomKey;
    }
    const keys = Object.keys(obj[`o_${this.code}`][type]["words"] || obj.o_es);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return obj[`o_${this.code}`][type]["words"][randomKey] || obj.o_es[type][randomKey] || randomKey;

  }

  setLanguage (code = "en") {
    this.code = String(code).toLowerCase();
  }

  getLanguage () {
    return this.code;
  }
}

export const locale = new Locale("en");

export const t = (key) => {
  return locale.get(key).toUpperCase();
};
