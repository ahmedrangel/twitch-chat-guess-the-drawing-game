
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
  app.style.transform = `translate(-50%, -50%) scale(${scale})`;
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

export const randomOptionsHandler = (type) => {
  const objs = locale.getCategoryObjects();
  let options;
  if (type === "games") {
    options = {
      game: Object.keys(objs[type]["game_type"])[0],
    };
  }
  return options;
};

export const getObjectLength = (type) => {
  const length = JSONPath({path: `$..[?(@.id=="${type}")]..words`, json: locale.getCategoryObjects()})[0];
  return Object.keys(length).length;
};