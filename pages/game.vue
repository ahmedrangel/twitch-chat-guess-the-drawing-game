<script setup>
definePageMeta({ middleware: "session" });
</script>
<template>
  <main class="my-2 centered-content">
    <div id="game" @keydown="keydown" @keyup="keyup">
      <div class="row row-cols-2 g-4">
        <div class="col-4">
          <div class="row row-cols-1 g-0">
            <div id="chat-scores" class="col d-flex p-3">
              <div class="chat overflow-hidden d-flex justify-content-end flex-column">
                <div v-for="(chat, index) of comment" :key="index" class="col-12 mb-0">
                  <span class="chat-names">{{ chat.display_name }}</span>
                </div>
              </div>
            </div>
            <div id="twitch-chat" class="col d-flex p-3">
              <div class="chat overflow-hidden d-flex justify-content-end flex-column">
                <div v-for="(chat, index) of comment" :key="index" class="col-12 mb-0">
                  <span class="chat-names">{{ chat.display_name }}:</span> <span class="chat-messages">{{ chat.message }}</span>
                </div>
              </div>
            </div>
            <div id="board-tools" class="col text-center d-flex align-items-center justify-content-center p-3">
              <div v-if="wordPicking" id="picker">
                <h2>ELIGE UNA PALABRA</h2>
                <div v-for="(w, index) of randomObjects" :key="index" class="btn d-flex justify-content-center align-items-center my-3 py-3 px-5" @click="startGame">
                  <h2 class="m-0">{{ w }}</h2>
                </div>
              </div>
              <div v-else-if="gameStarted">
                <div id="tools" class="my-2">
                  <button :class="`btn me-1 ${toolMode === `pen` ? `btn-active` : ``}`" @click="mode(`pen`)">
                    <span class="m-0 h3 d-flex align-items-center justify-content-center">
                      <Icon class="iconify" name="ph:pencil-duotone" />
                    </span>
                  </button>
                  <button :class="`btn mx-1 ${toolMode === `brush` ? `btn-active` : ``}`" @click="mode(`brush`)">
                    <span class="m-0 h3 d-flex align-items-center justify-content-center">
                      <Icon class="iconify" name="ph:paint-brush" />
                    </span>
                  </button>
                  <button :class="`btn mx-1 ${toolMode === `eraser` ? `btn-active` : ``}`" @click="mode(`eraser`)">
                    <span class="m-0 h3 d-flex align-items-center justify-content-center">
                      <Icon class="iconify" name="ph:eraser-duotone" />
                    </span>
                  </button>
                  <button :class="`btn mx-1 ${toolMode === `bucket` ? `btn-active` : ``}`" @click="mode(`bucket`)">
                    <span class="m-0 h3 d-flex align-items-center justify-content-center">
                      <Icon class="iconify" name="ph:paint-bucket-duotone" />
                    </span>
                  </button>
                  <button class="btn mx-1" @click="mode(`clear`)">
                    <span class="m-0 h3 d-flex align-items-center justify-content-center">
                      <Icon class="iconify" name="ph:trash-duotone" />
                    </span>
                  </button>
                  <button class="btn ms-4 me-1" @click="undo">
                    <span class="m-0 h3 d-flex align-items-center justify-content-center">
                      <Icon class="iconify" name="ph:arrow-bend-up-left-bold" />
                    </span>
                  </button>
                  <button class="btn ms-1" @click="redo">
                    <span class="m-0 h3 d-flex align-items-center justify-content-center">
                      <Icon class="iconify" name="ph:arrow-bend-up-right-bold" />
                    </span>
                  </button>
                </div>
                <div class="my-2 d-flex ranges align-items-center justify-content-center">
                  <input v-model="lineSize" type="range" class="mx-2" min="4" max="100" step="2" @input="getLineSize">
                  <div class="dot-preview d-flex align-items-center justify-content-center mx-2">
                    <label class="dot d-flex" :style="`height:${lineSize}px; width: ${lineSize}px; background-color: ${color}`" />
                  </div>
                </div>
                <div class="my-2 palette d-flex">
                  <span v-for="(c, index) of defaultColors()" :key="index" class="black mx-1" :style="`background-color:${c};`" @click="setColor(c)" />
                  <input type="color" class="color-picker mx-1" :value="color" @input="getStrokeColor">
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-8 p-0 pb-4 bg-canvas">
          <div id="canvas">
            <div :class="`top-info d-flex justify-content-end mt-3 ${wordPicking || gameStarted ? `visible` : `invisible`}`">
              <button class="btn" @click="stopGame">
                <Icon class="iconify" name="ph:x-bold" />
              </button>
            </div>
            <div v-if="!wordPicking || !gameStarted" :class="`top-info username position-absolute justify-content-center mt-3 d-flex`">
              <h2 class="m-0">{{ userClient.toUpperCase() }}</h2>
            </div>
            <div :class="` canvas-box ${gameStarted ? `d-block` : `d-none`}`">
              <canvas ref="canvas"
                      tabindex="0"
                      class="paint-canvas"
                      width="1134"
                      height="822"
                      @mousedown="startDrawing($event, `mouse`)"
                      @mousemove="drawLine($event, `mouse`)"
                      @mouseup="stopDrawing($event, `touch`)"
                      @mouseleave="outControl"
                      @mouseenter="outControl"
                      @touchstart="startDrawing"
                      @touchmove="drawLine($event, `touch`)"
                      @touchend="stopDrawing"
              />
            </div>
            <div :class="`justify-content-center align-content-center ${!gameStarted && wordPicking ? `picking` : null } ${!gameStarted && wordPicking || !gameStarted && !wordPicking ? `d-block` : `d-none`}`">
              <div v-if="!wordPicking" id="start" class="row justify-content-center align-content-center">
                <div class="col-12 w-75">
                  <div class="mb-5">
                    <div class="d-flex align-items-center mb-2">
                      <Icon class="iconify h2 me-2 my-0" name="ph:globe-simple-duotone" />
                      <span class=" h3 m-0">{{ t("language") }}</span>
                    </div>
                    <select v-model="lang">
                      <option value="en">{{ t("english") }}</option>
                      <option value="es">{{ t("spanish") }}</option>
                    </select>
                  </div>
                  <div class="my-5 d-flex">
                    <div class="col-7">
                      <div class="d-flex align-items-center mb-2">
                        <Icon class="iconify h2 me-2 my-0" name="ph:list-bullets-bold" />
                        <span class=" h3 m-0">{{ t("word_category") }}</span>
                      </div>
                      <select v-model="choosenCategory">
                        <option v-for="(c, index) of categories" :key="index" :value="c.type">{{ c.title }}</option>
                      </select>
                    </div>
                    <div v-if="choosenCategory ==`games`" class="col-5">
                      <h3 class="">{{ t("videogames") }}</h3>
                      <select v-model="choosenGame">
                        <option v-for="(g, index) of getGameObjects()" :key="index" :value="g.type">{{ g.game_name }}</option>
                      </select>
                    </div>
                  </div>
                  <div class="my-5">
                    <div class="d-flex align-items-center mb-2">
                      <Icon class="iconify h2 me-2 my-0" name="ph:clock-countdown-duotone" />
                      <span class=" h3 m-0">{{ t("timer") }}</span>
                    </div>
                    <select>
                      <option v-for="(timer, index) of timers" :key="index" :value="timer">{{ timer }} {{ t("seconds") }}</option>
                    </select>
                  </div>
                  <div class="mt-5">
                    <div class="d-flex align-items-center mb-2">
                      <Icon class="iconify h2 me-2 my-0" name="ph:arrows-clockwise-duotone" />
                      <span class=" h3 m-0">{{ t("rounds") }}</span>
                    </div>
                    <select>
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="15">15</option>
                      <option value="20">20</option>
                    </select>
                  </div>
                </div>
                <div class="col-12 d-flex justify-content-center align-items-center mt-5">
                  <button class="btn d-flex justify-content-center align-items-center mx-5 py-3 text-white logout" @click="logout">
                    <Icon class="iconify me-3" name="tabler:logout-2" />
                    <span class="">{{ t("logout") }}</span>
                  </button>
                  <button class="btn d-flex justify-content-center align-items-center mx-5 py-3 text-white gameStart" @click="pickWord">
                    <Icon class="iconify me-3" name="ph:play-duotone" />
                    <span class="">{{ t("start") }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
<script>
export default {
  data() {
    return {
      lang: "en",
      categories: null,
      timers: [30, 60, 90],
      rounds: [5, 10, 15, 20],
      client: null,
      chat_limit: 8,
      comment: [],
      color: "#000000",
      x: 0,
      y: 0,
      drawing: false,
      ctx: null,
      undoHistory: [],
      redoHistory: [],
      ctrl: false,
      shift: false,
      z: false,
      toolMode: "pen",
      lineSize: 14,
      tmi: this.$nuxt.$tmi,
      loginClient: null,
      userClient: null,
      points: 1,
      session: useUserSession(),
      gameStarted: false,
      wordPicking: false,
      out: false,
      up: true,
      choosenCategory: null,
      choosenGame: null,
      randomObjects: []
    };
  },
  watch: {
    lang (val) {
      locale.setLanguage(val);
      this.categories = getCategoryObjects();
    },
    choosenCategory (val) {
      this.choosenCategory = val;
      if (val === "games") {
        this.choosenGame = getGameObjects()[0].type;
      } else {
        this.choosenGame = null;
      }
    }
  },
  beforeUnmount() {
    this.client.disconnect();
    window.removeEventListener("resize", () => adjustScale(document));
  },
  created() {
    this.loginClient = this.session.user.login;
    this.userClient = this.session.user.display_name;
    const categoryObjects = getCategoryObjects();
    this.categories = categoryObjects;
    this.choosenCategory = categoryObjects[0].type;
  },
  mounted () {
    adjustScale(document);
    window.addEventListener("resize", () => adjustScale(document));
    this.client = new this.tmi.Client({
      connection: { secure: true, reconnect: true },
      channels: [this.userClient], // Twitch Channel
    });
    this.client.connect();
    this.client.on("message", (channel, tags, message) => {
      this.comment.length >= this.chat_limit ? this.comment.shift() : null;
      this.comment.push({display_name: tags["display-name"], message: message});
    });
    this.drawingBoard();
    document.addEventListener("mouseup", (event) => { this.outUpControl(event); });
    document.addEventListener("mousemove", (event) => { this.outUpControl(event); });
  },
  methods: {
    logout() {
      this.session.clear();
      this.$router.replace("/");
    },
    startGame() {
      this.gameStarted = true;
      this.wordPicking = false;
    },
    pickWord() {
      this.wordPicking = true;
      this.randomize();
    },
    randomize () {
      const options = randomOptionsHandler(this.choosenCategory, this.choosenGame);
      const length = this.choosenCategory == "games" ? getObjectLength(this.choosenGame) : getObjectLength(this.choosenCategory);
      const random1 = locale.getRandomObject(this.choosenCategory, options);
      let random2;
      if (length > 1) {
        do {
          random2 = locale.getRandomObject(this.choosenCategory, options);
        } while (random1 === random2);
        this.randomObjects = [random1, random2];
      } else {
        this.randomObjects = [random1];
      }
    },
    stopGame() {
      this.gameStarted = false;
      this.wordPicking = false;
      this.undoHistory = [];
      this.redoHistory = [];
      this.mode("clear");
      this.lineSize = 14;
      this.toolMode = "pen";
      this.color = "#000000";
      this.ctx.strokeStyle = this.color;
      this.comment = [];
    },
    getStrokeColor(event) {
      this.color = event.target.value;
      this.ctx.strokeStyle = this.color;
    },
    getLineSize(event) {
      this.lineSize = event.target.value;
      this.ctx.lineWidth = this.toolMode === "brush" ? parseInt(this.lineSize) * 0.02 : this.lineSize;
    },
    setColor(color) {
      this.color = color;
      this.ctx.strokeStyle = this.color;
    },
    startDrawing (event, type) {
      const rect = event.target.getBoundingClientRect();
      const mouse = type === "touch" ? event.changedTouches[0] : event;
      const x = Math.round((mouse.pageX - rect.left) * event.target.width / rect.width);
      const y = Math.round((mouse.pageY - rect.top) * event.target.height / rect.height);
      if (["pen", "eraser", "brush"].includes(this.toolMode)) {
        this.ctx.globalCompositeOperation = this.toolMode === "eraser" ? "destination-out" : "source-over";
        this.points = this.toolMode === "brush" ? parseInt(this.lineSize) + 4 : 1;
        this.drawing = true;
        [this.x, this.y] = [x, y];
        this.ctx.beginPath();
        for (let i = 0; i < this.points; i ++) {
          this.ctx.rect(this.x + i,this.y + i,0,0,Math.PI*2,false);
        }
        this.ctx.stroke();
        this.ctx.globalCompositeOperation="source-over";
      } else {
        this.drawing = false;
        const imageData = this.ctx.getImageData(0, 0, this.$refs.canvas.width, this.$refs.canvas.height);
        [this.x, this.y] = [x, y];
        floodFill(imageData, this.color, this.x, this.y);
        this.ctx.putImageData(imageData, 0, 0);
      }
    },
    stopDrawing () {
      this.drawing = false;
      this.undoHistory.push(this.$refs.canvas.toDataURL());
      this.redoHistory = [];
    },
    drawLine(event, type) {
      if (!this.drawing) return;
      const rect = event.target.getBoundingClientRect();
      const mouse = type === "touch" ? event.changedTouches[0] : event;
      const x = Math.round((mouse.pageX - rect.left) * event.target.width / rect.width);
      const y = Math.round((mouse.pageY - rect.top) * event.target.height / rect.height);
      this.ctx.globalCompositeOperation = this.toolMode === "eraser" ? "destination-out" : "source-over";
      this.ctx.beginPath();
      for (let i = 0; i < this.points; i++) {
        this.ctx.moveTo(this.x + i, this.y + i);
        this.ctx.lineTo(x + i, y + i);
      }
      this.ctx.stroke();
      [this.x, this.y] = [x, y];
      this.ctx.globalCompositeOperation="source-over";
    },
    undo () {
      const lastState = this.undoHistory.pop();
      if (lastState) {
        this.redoHistory.push(lastState);
        const undoState = this.undoHistory[this.undoHistory.length - 1];
        if (undoState !== undefined) {
          const image = new Image();
          image.onload = () => {
            this.ctx.clearRect(0, 0, this.$refs.canvas.width, this.$refs.canvas.height);
            this.ctx.drawImage(image, 0, 0);
          };
          image.src = undoState;
        } else {
          this.ctx.clearRect(0, 0, this.$refs.canvas.width, this.$refs.canvas.height);
        }
      }
    },
    redo() {
      const redoState = this.redoHistory.pop();
      if (redoState) {
        const image = new Image();
        image.onload = () => {
          this.ctx.clearRect(0, 0, this.$refs.canvas.width, this.$refs.canvas.height);
          this.ctx.drawImage(image, 0, 0);
        };
        image.src = redoState;
        this.undoHistory.push(redoState);
      }
    },
    mode(mode) {
      mode !== "clear" ? this.toolMode = mode : null;
      this.ctx.lineWidth = this.toolMode === "brush" ? parseInt(this.lineSize) * 0.02 : this.lineSize;
      if (mode === "clear") {
        this.ctx.globalCompositeOperation="destination-out";
        this.ctx.rect(1,1,this.$refs.canvas.width,this.$refs.canvas.height,Math.PI*2,false);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.globalCompositeOperation="source-over";
        this.stopDrawing();
      }
    },
    keydown (event) {
      event.key === "Control" ? this.ctrl = true : null;
      event.key === "Shift" ? this.shift = true : null;
      event.key.toLowerCase() === "z" ? this.z = true : null;
      if (this.ctrl && !this.shift && this.z) {
        this.undo();
      } else if (this.ctrl && this.shift && this.z) {
        this.redo();
      }
    },
    keyup(event) {
      event.key === "Control" ? this.ctrl = false : null;
      event.key === "Shift" ? this.shift = false : null;
      event.key.toLowerCase() === "z" ? this.z = false : null;
    },
    outControl(event) {
      event.type === "mouseleave" ? this.out = true : this.out = false;
    },
    outUpControl(event) {
      if (event.type === "mouseup" && this.out && this.drawing) {
        this.stopDrawing(event);
      } else if (event.type === "mousemove" && this.out && this.drawing) {
        const rect = event.target.getBoundingClientRect();
        this.x = Math.round(((event.pageX - rect.left) * event.target.width) / rect.width);
        this.y = Math.round(((event.pageY - rect.top) * event.target.height) / rect.height);
      }
    },
    drawingBoard() {
      this.ctx = this.$refs.canvas.getContext("2d", {willReadFrequently: true});
      this.ctx.lineJoin = "round";
      this.ctx.lineCap = "round";
      this.ctx.lineWidth = this.lineSize;
    },
  },
};
</script>