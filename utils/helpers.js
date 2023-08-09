
import { JSONPath } from "jsonpath-plus";
export const defaultColors = () => {
  return {
    black: "#000000",
    grey: "#c5c5c5",
    white: "#FFFFFF",
    red: "#ff4066",
    pink: "#ff80e3",
    purple: "#b386e3",
    blue: "#6666FF",
    cian: "#66FFFF",
    green: "#66FF66",
    yellow: "#FFFF66",
    orange: "#ffa666",
    brown: "#9d715b",
  };
};

export const adjustScale = (document) => {
  const referenceWidth = 1920;
  const referenceHeight = 940;
  const currentWidth = document.documentElement.clientWidth;
  const currentHeight = document.documentElement.clientHeight;
  const scaleX = currentWidth / referenceWidth;
  const scaleY = currentHeight / referenceHeight;
  const scale = Math.min(scaleX, scaleY);
  const app = document.getElementById("game");
  const modal_g = document.getElementById("modal-g");
  const modal_n = document.getElementById("modal-n");
  const translate = `translate(-50%, -50%) scale(${scale})`;
  [app.style.transform, modal_g.style.transform, modal_n.style.transform] = [translate, translate, translate];
};

export const getCategoryObjects = () => {
  const objs = Object.keys(locale.getCategoryObjects());
  const objArray = [];
  objs.forEach((el, i) => {
    objArray.push({
      type: objs[i],
      title: locale.getCategoryObjects()[el].title.toUpperCase(),
      length: locale.getCategoryObjects()[objs[i]]
    });
  });
  return objArray;
};

export const getGameObjects = () => {
  const objs = Object.keys(locale.getCategoryObjects()["games"]["game_type"]);
  const objArray = [];
  objs.forEach((el) => {
    objArray.push({
      type: el,
      game_name: locale.getCategoryObjects()["games"]["game_type"][el].game_name.toUpperCase()
    });
  });
  return objArray;
};

export const getObjectLength = (type) => {
  const length = JSONPath({path: `$..[?(@.id=="${type}")]..words`, json: locale.getCategoryObjects()})[0];
  return Object.keys(length).length;
};

export const removeDiacritics = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

export const timeLeft = (s) => {
  const ms = s;
  const time = new Date(Math.ceil(ms)).toISOString().slice(14, -5);
  return time;
};

export const percentage = (val, total) => {
  return ((val * 100) / total).toFixed(2);
};