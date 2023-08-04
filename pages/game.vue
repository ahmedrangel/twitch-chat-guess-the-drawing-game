<script setup>
definePageMeta({ middleware: "session" });
</script>
<template>
  <main class="my-2 centered-content">
    <div id="game" @keydown="keydown" @keyup="keyup">
      <div class="row row-cols-2 g-4">
        <div class="col-4">
          <div class="row row-cols-1 g-0">
            <div id="twitch-chat" class="col d-flex p-3">
              <div class="overflow-hidden d-flex justify-content-end flex-column">
                <p v-for="(chat, index) of comment" :key="index" class="col-12 mb-1">
                  <b>{{ chat.display_name }}:</b> {{ chat.message }}
                </p>
              </div>
            </div>
            <div id="board-tools" class="col text-center d-flex align-items-center justify-content-center p-3">
              <div v-if="gameStarted">
                <div id="tools" class="my-2">
                  <button :class="`btn me-1 ${toolMode === `pen` ? `btn-active` : ``}`" @click="mode(`pen`)">
                    <span class="m-0 h3 d-flex align-items-center justify-content-center">
                      <Icon class="iconify" name="ph:pencil-simple-duotone" />
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
                <div class="my-2 d-flex ranges justify-content-center">
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
            <div :class="`top-info d-flex justify-content-end mt-3 ${gameStarted ? `visible` : `invisible`}`">
              <button class="btn" @click="stopGame">
                <Icon class="iconify" name="ph:x-bold" />
              </button>
            </div>
            <canvas ref="canvas"
                    tabindex="0"
                    :class="`paint-canvas ${gameStarted ? `d-block` : `d-none`}`"
                    width="1134"
                    height="822"
                    @mousedown="startDrawing"
                    @mousemove="drawLine"
                    @mouseup="stopDrawing"
                    @mouseleave="outControl"
                    @mouseenter="outControl"
                    @touchstart="startDrawing"
                    @touchmove="drawLine"
                    @touchend="stopDrawing"
            />
            <div id="start" :class="`justify-content-center align-content-center ${!gameStarted ? `row` : `d-none`}`">
              <div class="col-12 d-flex justify-content-center align-items-center">
                <h1>{{ userClient }}</h1>
              </div>
              <div class="col-12 d-flex justify-content-center align-items-center mt-5">
                <button class="btn d-flex justify-content-center align-items-center mx-5 py-3" @click="logout">
                  <Icon class="iconify me-3" name="tabler:logout-2" />
                  <span>LOG OUT</span>
                </button>
                <button class="btn d-flex justify-content-center align-items-center mx-5 py-3" @click="startGame">
                  <Icon class="iconify me-3" name="ph:play-duotone" />
                  <span>START</span>
                </button>
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
      client: null,
      chat_limit: 12,
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
      lineSize: 5,
      tmi: this.$nuxt.$tmi,
      loginClient: null,
      userClient: null,
      points: 1,
      session: useUserSession(),
      gameStarted: false,
      out: false,
      up: true
    };
  },
  beforeUnmount() {
    this.client.disconnect();
    window.removeEventListener("resize", this.adjustScale);
  },
  mounted () {
    this.loginClient = this.session.user.login;
    this.userClient = this.session.user.display_name;
    this.adjustScale();
    this.drawingBoard();
    window.addEventListener("resize", this.adjustScale);
    document.body.addEventListener("touchmove", (event) => { event.preventDefault(); }, { passive: false });
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
      this.client = new this.tmi.Client({
        connection: { secure: true, reconnect: true },
        channels: [this.userClient], // Twitch Channel
      });
      this.client.connect();
      this.client.on("message", (channel, tags, message) => {
        this.comment.length >= this.chat_limit ? this.comment.shift() : null;
        this.comment.push({display_name: tags["display-name"], message: message});
      });
    },
    stopGame() {
      this.gameStarted = false;
      this.undoHistory = [];
      this.redoHistory = [];
      this.mode("clear");
      this.lineSize = 5;
      this.toolMode = "pen";
      this.color = "#000000";
      this.ctx.strokeStyle = this.color;
      this.client.disconnect();
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
    startDrawing (event) {
      let x, y;
      const rect = event.target.getBoundingClientRect();
      if (event.type === "touchstart") {
        const touch = event.changedTouches[0];
        x = Math.round((touch.pageX - rect.left) * event.target.width / rect.width);
        y = Math.round((touch.pageY - rect.top) * event.target.height / rect.height);
      } else {
        x = event.offsetX;
        y = event.offsetY;
      }
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
    drawLine(event) {
      if (!this.drawing) return;
      let x, y;
      const rect = event.target.getBoundingClientRect();
      if (event.type === "touchmove") {
        const touch = event.changedTouches[0];
        x = Math.round((touch.pageX - rect.left) * event.target.width / rect.width);
        y = Math.round((touch.pageY - rect.top) * event.target.height / rect.height);
      } else {
        x = event.offsetX;
        y = event.offsetY;
      }
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
        this.ctx.beginPath();
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
      event.key.toLowerCase() == "z" ? this.z = true : null;
      if (this.ctrl && !this.shift && this.z) {
        this.undo();
      } else if (this.ctrl && this.shift && this.z) {
        this.redo();
      }
    },
    keyup(event) {
      event.key === "Control" ? this.ctrl = false : null;
      event.key === "Shift" ? this.shift = false : null;
      event.key.toLowerCase() == "z" ? this.z = false : null;
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
      this.ctx.lineCap = "round";
      this.ctx.lineWidth = this.lineSize;
    },
    adjustScale() {
      const referenceWidth = 1920;
      const referenceHeight = 940;
      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;
      const scaleX = currentWidth / referenceWidth;
      const scaleY = currentHeight / referenceHeight;
      const scale = Math.min(scaleX, scaleY);
      const app = document.getElementById("game");
      app.style.transform = `translate(-50%, -50%) scale(${scale})`;
    },
  },
};
</script>