<script setup>
definePageMeta({ middleware: "session" });
</script>
<template>
  <main class="my-2 centered-content">
    <!-- Modal Guessed -->
    <div id="modal-g" ref="modal_g" class="modal fade" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-body text-center py-4">
            <h1 class="whoguessed text-break">{{ whoGuessed }}</h1>
            <div class="d-flex align-items-center justify-content-center">
              <img class="diamond-guess diamond" src="/images/diamond-guess-sq.svg">
              <h2 class="my-0 mx-4">{{ t("guessed_it") }}</h2>
              <img class="diamond-guess diamond" src="/images/diamond-guess-sq.svg">
            </div>
            <h3 class="fst-italic mt-4">{{ guessWord }}</h3>
            <img class="draw img-fluid my-4" :src="imagePng">
            <button type="button" class="btn mt-4 py-2" data-bs-dismiss="modal" @click="continueNext()">
              <div class="d-flex align-items-center justify-content-center">
                <h2 class="m-0">{{ t("continue") }}<Icon class="ms-2 iconify" name="ph:caret-double-right-bold" /></h2>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Modal No Guessed -->
    <div id="modal-n" ref="modal_n" class="modal fade" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-body text-center py-4">
            <h1 class="whoguessed no-one-guessed text-break">{{ t("no_one_guessed") }} :(</h1>
            <h2 class="m-0">{{ t("try_again") }}</h2>
            <h3 class="fst-italic mt-4">{{ guessWord }}</h3>
            <img class="draw img-fluid my-4" :src="imagePng">
            <button type="button" class="btn mt-4 py-2" data-bs-dismiss="modal" @click="continueNext()">
              <div class="d-flex align-items-center justify-content-center">
                <h2 class="m-0">{{ t("continue") }}<Icon class="ms-2 iconify" name="ph:caret-double-right-bold" /></h2>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div id="game" @keydown="keydown" @keyup="keyup">
      <div class="row row-cols-2 g-4">
        <div class="col-4">
          <div class="row row-cols-1 g-0">
            <div id="chat-scores" class="col d-flex-inline p-3 position-relative">
              <img class="position-absolute top-0 start-0 opacity-25" src="/images/grid-scores.png">
              <div class="chat overflow-hidden d-flex justify-content-start flex-column position-relative">
                <div v-for="(chat, index) of ranking" :key="index < 5" class="col-12 mb-0 d-flex align-items-center justify-content-between">
                  <span class="chat-names">{{ chat.display_name }}</span>
                  <div class="d-flex align-items-center position-absolute end-0 score">
                    <img class="diamond-icon diamond me-1" src="/images/diamond-guess-sq.svg">
                    <span class="chat-names">{{ chat.score }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div id="twitch-chat" class="col d-flex p-3">
              <div class="chat overflow-hidden d-flex justify-content-end flex-column">
                <div v-for="(chat, index) of comment" :key="index" :class="`col-12 mb-0 ${chat.guessed ? `text-dark` : `text-secondary`}`">
                  <img v-if="chat.guessed" class="diamond-icon diamond me-1 align-text-top" src="/images/diamond-guess-sq.svg">
                  <Icon v-else class="iconify me-1 align-text-top" name="ic:twotone-chat-bubble" />
                  <span class="chat-names me-1">{{ chat.display_name }}:</span><span class="chat-messages">{{ chat.message }}</span>
                </div>
              </div>
            </div>
            <div id="board-tools" class="col text-center d-flex align-items-center justify-content-center p-3 position-relative">
              <div v-if="!wordPicking && !gameStarted">
                <div class="camera-text position-relative">
                  <h2>{{ t("hide_this_box") }}</h2>
                  <h2>{{ t("or") }} {{ t("place_your_camera_here") }}</h2>
                  <h2>{{ t("before_you_start_the_game") }}</h2>
                </div>
                <Icon class="camera position-absolute top-50 start-50 translate-middle" name="ph:camera-duotone" />
              </div>
              <div v-if="wordPicking" id="picker">
                <h2>{{ t("choose_a_word") }}</h2>
                <div v-for="(w, index) of randomObjects" :key="index" class="btn d-flex justify-content-center align-items-center my-3 py-3 px-5" @click="startGame(w)">
                  <h2 class="m-0">{{ w }}</h2>
                </div>
                <div class="d-flex align-items-center justify-content-center">
                  <div class="re-randomize btn" @click="randomize()">
                    <Icon class="iconify" name="ph:arrow-clockwise-bold" />
                  </div>
                </div>
              </div>
              <div v-else-if="gameStarted">
                <div id="guess" class="mt-2 mb-3">
                  <h5 class="m-0">{{ t("draw_this_word") }}</h5>
                  <h3 class="m-0 guess-word">{{ guessWord }}</h3>
                </div>
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
              <button class="btn" @click="stopGame()">
                <Icon class="iconify" name="ph:x-bold" />
              </button>
            </div>
            <div v-if="wordPicking || gameStarted" :class="`top-info username position-absolute justify-content-start mt-3 d-flex`">
              <h2 class="m-0">{{ t("round") }}: {{ round }}/{{ choosenRound }}</h2>
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
              <div v-if="!wordPicking && !gameFinished" id="start" class="row justify-content-center align-content-center">
                <div class="col-12 w-75">
                  <div class="mb-5">
                    <div class="d-flex align-items-center mb-2">
                      <Icon class="iconify h2 me-2 my-0" name="ph:globe-simple-duotone" />
                      <span class=" h3 m-0">{{ t("language") }}</span>
                    </div>
                    <select v-model="lang">
                      <option value="es">{{ t("spanish") }}</option>
                      <option value="en">{{ t("english") }}</option>
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
                    <select v-model="choosenTimer">
                      <option v-for="(v, index) of timers" :key="index" :value="v">{{ timeLeft(v * 1000) }} ({{ v }} {{ t("seconds") }})</option>
                    </select>
                  </div>
                  <div class="mt-5">
                    <div class="d-flex align-items-center mb-2">
                      <Icon class="iconify h2 me-2 my-0" name="ph:arrows-clockwise-duotone" />
                      <span class=" h3 m-0">{{ t("rounds") }}</span>
                    </div>
                    <select v-model="choosenRound">
                      <option v-for="(v, index) of rounds" :key="index" :value="v">{{ v }}</option>
                    </select>
                  </div>
                </div>
                <div class="col-12 d-flex justify-content-center align-items-center mt-5">
                  <button class="btn d-flex justify-content-center align-items-center mx-5 py-3 text-white logout" @click="logout()">
                    <Icon class="iconify me-3" name="tabler:logout-2" />
                    <span class="">{{ t("logout") }}</span>
                  </button>
                  <button class="btn d-flex justify-content-center align-items-center mx-5 py-3 text-white gameStart" @click="pickWord()">
                    <Icon class="iconify me-3" name="ph:play-duotone" />
                    <span class="">{{ t("start") }}</span>
                  </button>
                </div>
              </div>
              <div v-if="gameFinished && !gameStarted" id="finished" class="row justify-content-center align-items-center">
                <div class="finished-bg overflow-hidden position-relative text-center p-3 mt-3">
                  <h1 class="mb-3">{{ t("end_of_the_game") }}</h1>
                  <ol class="list-group list-group-numbered">
                    <li v-for="(chat, index) of ranking" :key="index < 5" class="h3 col-12 mb-0 list-group-item d-flex align-items-center p-0 ">
                      <div class="d-flex w-100 justify-content-between align-items-center">
                        <h2 class="chat-names ms-2 mb-0">{{ chat.display_name }}</h2>
                        <div class="d-flex justify-content-center align-self-center finished-score">
                          <img class="diamond-icon diamond me-1" src="/images/diamond-guess-sq.svg">
                          <span class="chat-names">{{ chat.score }}</span>
                        </div>
                      </div>
                    </li>
                  </ol>
                </div>
                <div id="restart" class="d-flex justify-content-center align-self-center mb-3">
                  <button type="button" class="btn py-2 px-5" @click="restartGame()">
                    <div class="d-flex align-items-center justify-content-center">
                      <h2 class="m-0">{{ t("reiniciar") }}</h2>
                      <Icon class="ms-2 iconify h2 m-0" name="ph:arrow-u-up-left-duotone" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
            <div id="progress" class="w-100">
              <div class="d-flex px-4 d-flex justify-content-center align-items-center">
                <div class="d-flex justify-content-center align-items-center">
                  <Icon class="iconify h2 me-2 my-0" name="ph:alarm-duotone" />
                  <h4 class="me-2 mb-0 countdown-timer">{{ timeLeft(timer) }}</h4>
                </div>
                <div class="progress w-100">
                  <div :class="`progress-bar ${gameStarted ? `progress-bar-striped` : ``} progress-bar-animated`" role="progressbar" :aria-valuenow="`${percentage(timer / 1000, choosenTimer)}`" aria-valuemin="0" aria-valuemax="100" :style="`width: ${percentage(timer / 1000, choosenTimer)}%`" />
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
      lang: "es",
      categories: null,
      timers: [30, 60, 90, 120],
      rounds: [5, 10, 15, 20],
      client: null,
      chat_limit: 9,
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
      choosenTimer: null,
      choosenRound: null,
      randomObjects: [],
      guessWord: null,
      guessers: [],
      round: 1,
      whoGuessed: null,
      imagePng: null,
      timer: 0,
      gameFinished: null,
      is_guessed: false,
    };
  },
  computed: {
    ranking () {
      return this.guessers.sort((a, b) => parseInt(b.score) - parseInt(a.score));
    },
    finalRanking () {
      return this.guessers.sort((a, b) => parseInt(b.score) - parseInt(a.score)).slice(0, 12);
    }
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
    this.choosenRound = this.rounds[0];
    this.choosenTimer = this.timers[0];
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
      const display_name = tags["display-name"];
      this.comment.length >= this.chat_limit ? this.comment.shift() : null;
      if (!this.is_guessed && this.guessWord !== null &&
          removeDiacritics(message).toLowerCase() === removeDiacritics(this.guessWord).toLowerCase() &&
          this.round <= this.choosenRound) {
        this.comment.push({display_name: display_name, message: message, guessed: true});
        this.is_guessed = true;
        this.whoGuessed = display_name.toUpperCase();
        const newGuesser = {display_name: display_name, score: Math.round(parseInt(this.timer) / 1000)};
        const index = this.guessers.findIndex(item => item.display_name === newGuesser.display_name);
        if (index !== -1) {
          this.guessers[index].score += newGuesser.score;
        } else {
          this.guessers.push({display_name: display_name, score: Math.round(parseInt(this.timer) / 1000)});
        }
        this.imagePng = this.$refs.canvas.toDataURL("image/png");
        this.$nuxt.$bootstrap.showModal(this.$refs.modal_g);
      } else {
        this.comment.push({display_name: display_name, message: message, guessed: false});
      }
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
    startGame(word) {
      this.gameStarted = true;
      this.wordPicking = false;
      this.guessWord = word;
      this.gameFinished = false;
      this.countdown();
    },
    pickWord() {
      this.wordPicking = true;
      this.timer = this.choosenTimer * 1000;
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
      this.guessWord = null;
      this.round = 1;
      this.whoGuessed = null;
      this.timer = 0;
    },
    restartGame() {
      this.gameFinished = null;
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
    continueNext() {
      this.$nuxt.$bootstrap.hideModal("modal_g");
      this.$nuxt.$bootstrap.hideModal("modal_n");
      this.is_guessed = false;
      this.timer = this.choosenTimer * 1000;
      this.randomize();
      this.round++;
      this.mode("clear");
      this.wordPicking = true;
      this.gameStarted = false;
      if (this.round > this.choosenRound) {
        this.gameFinished = true;
        this.gameStarted = false;
        this.stopGame();
      }
    },
    countdown () {
      this.timer = this.choosenTimer * 1000;
      const interval = setInterval(() => {
        if (parseInt(this.timer) <= 0 && !this.is_guessed && this.gameStarted) {
          clearInterval(interval);
          this.imagePng = this.$refs.canvas.toDataURL("image/png");
          this.$nuxt.$bootstrap.showModal(this.$refs.modal_n);
        } else if (parseInt(this.timer) > 0 && this.is_guessed || !this.gameStarted && !this.wordPicking) {
          clearInterval(interval);
        } else {
          this.timer = this.timer - 100;
        }
      }, 100);
    }
  },
};
</script>