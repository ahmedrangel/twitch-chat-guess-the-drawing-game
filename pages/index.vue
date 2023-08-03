<template>
  <main class="my-2 centered-content">
    <div id="game"
         @keydown="keydown"
         @keyup="keyup"
    >
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
              <div>
                <div id="tools" class="my-4">
                  <button :class="`btn me-1 ${toolMode == `pen` ? `btn-active` : ``}`" @click="mode(`pen`)">
                    <span class="m-0 h3 d-flex align-items-center justify-content-center">
                      <Icon class="iconify" name="ph:pencil-simple-duotone" />
                    </span>
                  </button>
                  <button :class="`btn mx-1 ${toolMode == `brush` ? `btn-active` : ``}`" @click="mode(`brush`)">
                    <span class="m-0 h3 d-flex align-items-center justify-content-center">
                      <Icon class="iconify" name="ph:paint-brush" />
                    </span>
                  </button>
                  <button :class="`btn mx-1 ${toolMode == `eraser` ? `btn-active` : ``}`" @click="mode(`eraser`)">
                    <span class="m-0 h3 d-flex align-items-center justify-content-center">
                      <Icon class="iconify" name="ph:eraser-duotone" />
                    </span>
                  </button>
                  <button :class="`btn mx-1 ${toolMode == `bucket` ? `btn-active` : ``}`" @click="mode(`bucket`)">
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
                <div class="my-4 d-flex ranges justify-content-center">
                  <input v-model="lineSize" type="range" class="mx-2" min="5" max="110" step="5" @input="getLineSize">
                  <div class="dot-preview d-flex align-items-center justify-content-center mx-2">
                    <label class="dot d-flex" :style="`height:${lineSize}px; width: ${lineSize}px; background-color: ${color}`" />
                  </div>
                </div>
                <div class="my-4 palette d-flex">
                  <span v-for="(c, index) of defaultColors()" :key="index" class="black mx-1" :style="`background-color:${c};`" @click="setColor(c)" />
                  <input type="color" class="color-picker mx-1" :value="color" @input="getStrokeColor">
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-8 p-0 bg-canvas">
          <canvas ref="canvas"
                  tabindex="0"
                  class="paint-canvas d-block"
                  width="1134"
                  height="872"
                  @mousedown="startDrawing($event, `mouse`)"
                  @mousemove="drawLine($event, `mouse`)"
                  @mouseup="stopDrawing()"
                  @touchstart="startDrawing($event, `touch`)"
                  @touchmove="drawLine($event, `touch`)"
                  @touchend="stopDrawing()"
          />
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
      userClient: null,
      points: 1,
    };
  },
  beforeUnmount() {
    this.client.disconnect();
    window.removeEventListener("resize", this.adjustScale);
  },
  mounted () {
    this.userClient = "xqc";
    this.adjustScale();
    this.client = new this.tmi.Client({
      connection: { secure: true, reconnect: true },
      channels: [this.userClient], // Twitch Channel Test
    });
    this.client.connect();
    this.client.on("message", (channel, tags, message) => {
      this.comment.length >= this.chat_limit ? this.comment.shift() : null;
      this.comment.push({display_name: tags["display-name"], message: message});
    });
    this.drawingBoard();
    window.addEventListener("resize", this.adjustScale);
    document.body.addEventListener("touchmove", function(e) { e.preventDefault(); }, { passive: false });
  },
  methods: {
    getStrokeColor(event) {
      this.color = event.target.value;
      this.ctx.strokeStyle = this.color; 
    },
    getLineSize(event) {
      this.lineSize = event.target.value;
      this.toolMode == "brush" ? this.ctx.lineWidth = parseInt(this.lineSize) * 0.02 : this.ctx.lineWidth = this.lineSize; 
    },
    setColor(color) {
      this.color = color;
      this.ctx.strokeStyle = this.color; 
      console.info(this.color);
    },
    startDrawing (event, type) {
      let x, y;
      if (type == "touch") {
        const rect = event.target.getBoundingClientRect();
        const rect_x = event.changedTouches[0].pageX - rect.left;
        const rect_y = event.changedTouches[0].pageY - rect.top;
        x = Math.round((rect_x * event.target.width) / rect.width);
        y = Math.round((rect_y * event.target.height) / rect.height);
      } else {
        x = event.offsetX;
        y = event.offsetY;
      }
      if (this.toolMode == "pen" || this.toolMode == "eraser" || this.toolMode == "brush") {
        this.toolMode == "eraser" ? this.ctx.globalCompositeOperation="destination-out" : this.ctx.globalCompositeOperation="source-over";
        this.toolMode == "brush" ? this.points = parseInt(this.lineSize) + 4 : this.points = 1;
        this.drawing = true;   
        [this.x, this.y] = [x, y];
        this.ctx.beginPath();
        for (let i = 0; i < this.points; i ++) {
          this.ctx.rect(this.x + i,this.y + i,0,0,Math.PI*2,false);
        } 
        this.ctx.rect(this.x,this.y,0,0,Math.PI*2,false);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.globalCompositeOperation="source-over";
      } else {
        this.drawing = false; 
        const imageData = this.ctx.getImageData(0, 0, this.$refs.canvas.width, this.$refs.canvas.height);
        this.x = x;
        this.y = y;
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
      let x, y;
      if (type == "touch") {
        const rect = event.target.getBoundingClientRect();
        const rect_x = event.changedTouches[0].pageX - rect.left;
        const rect_y = event.changedTouches[0].pageY - rect.top;
        x = Math.round((rect_x * event.target.width) / rect.width);
        y = Math.round((rect_y * event.target.height) / rect.height);
      } else {
        x = event.offsetX;
        y = event.offsetY;
      }
      if (this.drawing) {
        this.toolMode == "eraser" ? this.ctx.globalCompositeOperation="destination-out" : this.ctx.globalCompositeOperation="source-over";
        this.ctx.beginPath();
        for (let i = 0; i < this.points; i++) {
          this.ctx.moveTo(this.x + i, this.y + i);
          this.ctx.lineTo(x + i, y + i);
        } 
        this.ctx.stroke();
        this.x = x;
        this.y = y;
        this.ctx.globalCompositeOperation="source-over";
      }
    },
    undo () {
      const lastState = this.undoHistory.pop();
      if (lastState) {
        this.redoHistory.push(lastState);
        const undoState = this.undoHistory[this.undoHistory.length - 1];
        if (undoState != undefined) {
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
    keydown (event) {
      event.key == "Control" ? this.ctrl = true : null;
      event.key == "Shift" ? this.shift = true : null;
      event.key.toLowerCase() == "z" ? this.z = true : null;
      console.info(event.key);
      if (this.ctrl == true && this.shift == false && this.z == true) {
        console.info("undo");
        this.undo();
      } else if (this.ctrl == true && this.shift == true && this.z == true) {
        console.info("redo");
        this.redo();
      }
    },
    keyup(event) {
      event.key == "Control" ? this.ctrl = false : null;
      event.key == "Shift" ? this.shift = false : null;
      event.key.toLowerCase() == "z" ? this.z = false : null;
    },
    mode(mode) {
      mode !== "clear" ? this.toolMode = mode : null;
      this.toolMode == "brush" ? this.ctx.lineWidth = parseInt(this.lineSize) * 0.02 : this.ctx.lineWidth = this.lineSize;
      if (mode == "clear") {
        this.ctx.globalCompositeOperation="destination-out";
        this.ctx.beginPath();
        this.ctx.rect(1,1,this.$refs.canvas.width,this.$refs.canvas.height,Math.PI*2,false);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.globalCompositeOperation="source-over";
        this.stopDrawing();
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
    }
  }
};
</script>