<template>
  <main class="my-2 centered-content">
    <div class="row row-cols-2 g-4">
      <div class="col-4">
        <div class="row row-cols-1 g-0">
          <div class="col twitch-chat overflow-hidden d-flex justify-content-end flex-column">
            <p v-for="(chat, index) of comment" :key="index" class="col-12 my-1">
              <b>{{ chat.display_name }}:</b> {{ chat.message }}
            </p>
          </div>
          <div class="col text-center board-tools d-flex align-items-center justify-content-center">
            <div>
              <div class="my-4">
                <button class="btn btn-primary mx-2" @click="mode(`pen`)">
                  <span class="m-0 h3 d-flex align-items-center justify-content-center">
                    <Icon class="iconify" name="ph:pencil-simple-duotone" />
                  </span>
                </button>
                <button class="btn btn-primary mx-2" @click="mode(`eraser`)">
                  <span class="m-0 h3 d-flex align-items-center justify-content-center">
                    <Icon class="iconify" name="ph:eraser-duotone" />
                  </span>
                </button>
                <button class="btn btn-primary mx-2" @click="mode(`bucket`)">
                  <span class="m-0 h3 d-flex align-items-center justify-content-center">
                    <Icon class="iconify" name="ph:paint-bucket-duotone" />
                  </span>
                </button>
              </div>
              <div class="my-4 d-flex ranges justify-content-center">
                <input type="range" class="js-line-range mx-2" min="5" max="120" step="5" @input="getLineSize($event)">
                <div class="dot-preview d-flex align-items-center justify-content-center mx-2">
                  <div class="dot d-flex" :style="`height:${lineSize}px; width: ${lineSize}px; background-color: ${color}`" />
                </div>
              </div>
              <div class="my-4 palette d-flex">
                <span v-for="(c, index) of defaultColors()" :key="index" class="black mx-1" :style="`background-color:${c};`" @click="setColor(c)" />
                <input type="color" class="js-color-picker color-picker mx-1" :value="color" @input="getStrokeColor($event)">
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-8">
        <canvas
          ref="canvas"
          tabindex="0"
          class="js-paint paint-canvas"
          width="1230"
          height="912"
          @mousedown="startDrawing($event)"
          @mousemove="drawLine($event)"
          @mouseup="stopDrawing()"
          @keydown="keydown($event)"
          @keyup="keyup($event)"
        />
      </div>
    </div>
  </main>
</template>
<script>
export default {
  data() {
    return {
      chat_limit: 14,
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
      penMode: true,
      bucketMode: false,
      eraserMode: false,
      lineSize: 5,
    };
  },
  beforeMount () {
    this.adjustScale();
  },
  mounted () {
    const tmi = this.$nuxt.$tmi;
    const client = new tmi.Client({
      connection: {
        secure: true,
        reconnect: true,
      },
      channels: ["xqc"], // Twitch Channel Test
    });
    client.connect();
    client.on("message", (channel, tags, message) => {
      if (this.comment.length >= this.chat_limit) {
        this.comment.shift();
      }
      this.comment.push({display_name: tags["display-name"], message: message});
    });

    this.drawingBoard();

    window.addEventListener("resize", this.adjustScale);
  },
  methods: {
    getStrokeColor(event) {
      this.color = event.target.value;
      this.ctx.strokeStyle = this.color; 
    },
    getLineSize(event) {
      this.lineSize = event.target.value;
      this.ctx.lineWidth = this.lineSize; 
    },
    setColor(color) {
      this.color = color;
      this.ctx.strokeStyle = this.color; 
      console.info(this.color);
    },
    startDrawing (event) {
      if (this.penMode || this.eraserMode) {
        this.eraserMode ? this.ctx.globalCompositeOperation="destination-out" : this.ctx.globalCompositeOperation="source-over";
        this.drawing = true;   
        [this.x, this.y] = [event.offsetX, event.offsetY];
        this.ctx.beginPath();
        this.ctx.arc(this.x,this.y,0,0,Math.PI*2,false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.globalCompositeOperation="source-over";
      } else {
        this.drawing = false; 
        const imageData = this.ctx.getImageData(0, 0, this.$refs.canvas.width, this.$refs.canvas.height);
        const rect = this.$refs.canvas.getBoundingClientRect();
        this.x = Math.round(event.clientX - rect.left);
        this.y = Math.round(event.clientY - rect.top);
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
      if (this.drawing) {
        this.eraserMode ? this.ctx.globalCompositeOperation="destination-out" : this.ctx.globalCompositeOperation="source-over";
        const newX = event.offsetX;
        const newY = event.offsetY;
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y);
        this.ctx.lineTo(newX, newY);
        this.ctx.stroke();
        this.x = newX;
        this.y = newY;
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
    mode (mode) {
      if (mode == "pen") {
        this.penMode = true;
        this.bucketMode = false;
        this.eraserMode = false;
      } else if (mode == "eraser") {
        this.penMode = false;
        this.bucketMode = false;
        this.eraserMode = true;
      } else if (mode == "bucket") {
        this.penMode = false;
        this.bucketMode = true;
        this.eraserMode = false;
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
      document.body.style.transform = `translate(-50%, -50%) 	scale(${scale})`;
    }
  }
};
</script>