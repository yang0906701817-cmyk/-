/*
  垃圾分類小達人

  功能：
  1. 一題一頁點選作答
  2. 每次開始遊戲會隨機排列題目
  3. 答對與答錯會播放不同音效
  4. 綠色圓形內會依照物品繪製不同圖示
  5. 答題後顯示下一題按鈕
  6. 完成後顯示分數、星星和每題結果

  使用方式：
  將本程式放在 VS Code 的 sketch.js。
*/

var screen = "start";

var questionIndex = 0;
var questionOrder = [];

var selectedAnswer = -1;
var answered = false;

var score = 0;
var answerResults = [];

var startTime = 0;
var finalTime = 0;

var soundReady = false;
var soundFailed = false;

var QUESTIONS = [
  {
    type: "bottle",
    question: "寶特瓶應該分類到哪裡？",
    options: ["一般垃圾", "資源回收", "廚餘", "有害垃圾"],
    answer: 1,
    explain: "寶特瓶清空、沖洗後可以放入資源回收。"
  },
  {
    type: "banana",
    question: "香蕉皮應該分類到哪裡？",
    options: ["一般垃圾", "資源回收", "廚餘", "有害垃圾"],
    answer: 2,
    explain: "香蕉皮可以分解，屬於廚餘。"
  },
  {
    type: "battery",
    question: "使用過的電池應該分類到哪裡？",
    options: ["一般垃圾", "資源回收", "廚餘", "有害垃圾"],
    answer: 3,
    explain: "電池含有特殊物質，應交給回收站。"
  },
  {
    type: "can",
    question: "喝完的鋁罐應該分類到哪裡？",
    options: ["一般垃圾", "資源回收", "廚餘", "有害垃圾"],
    answer: 1,
    explain: "鋁罐清空後可以放入資源回收。"
  },
  {
    type: "glass",
    question: "完整的玻璃瓶應該分類到哪裡？",
    options: ["一般垃圾", "資源回收", "廚餘", "有害垃圾"],
    answer: 1,
    explain: "完整的玻璃瓶清空後可以回收。"
  },
  {
    type: "tissue",
    question: "使用過的衛生紙應該分類到哪裡？",
    options: ["一般垃圾", "資源回收", "廚餘", "有害垃圾"],
    answer: 0,
    explain: "使用過的衛生紙通常受到污染，應丟入一般垃圾。"
  },
  {
    type: "food",
    question: "吃剩的飯菜應該分類到哪裡？",
    options: ["一般垃圾", "資源回收", "廚餘", "有害垃圾"],
    answer: 2,
    explain: "剩飯和剩菜屬於廚餘。"
  },
  {
    type: "cup",
    question: "破掉的陶瓷杯應該分類到哪裡？",
    options: ["一般垃圾", "資源回收", "廚餘", "有害垃圾"],
    answer: 0,
    explain: "破掉的陶瓷杯應包好後丟入一般垃圾。"
  }
];

function setup() {
  var canvas = createCanvas(800, 700);

  canvas.parent("game-container");
  canvas.elt.style.touchAction = "manipulation";

  textAlign(CENTER, CENTER);
  textFont("Arial");
}

function draw() {
  background("#EEF5F1");

  if (screen === "start") {
    drawStartScreen();
  }

  if (screen === "quiz") {
    drawQuizScreen();
  }

  if (screen === "result") {
    drawResultScreen();
  }
}

function drawHeader(title) {
  fill("#2F7658");
  noStroke();
  rect(0, 0, width, 78);

  fill("#FFFFFF");
  textSize(26);
  text(title, width / 2, 39);
}

function drawStartScreen() {
  drawHeader("垃圾分類小達人");

  fill("#245C4A");
  textSize(32);
  text("學會正確分類，保護地球！", width / 2, 160);

  fill("#3C9D70");
  textSize(85);
  text("♻", width / 2, 270);

  fill("#65766D");
  textSize(18);
  text("每次開始遊戲，題目都會重新排列", width / 2, 370);

  fill("#65766D");
  textSize(16);
  text("答對和答錯時會播放不同音效", width / 2, 400);

  drawButton(
    "開始測驗",
    width / 2 - 130,
    470,
    260,
    65,
    "#3C9D70"
  );
}

function drawQuizScreen() {
  var question = getCurrentQuestion();

  drawHeader("垃圾分類小達人");

  fill("#5E7069");
  textSize(17);

  text(
    "第 " + (questionIndex + 1) + " 題 / " + QUESTIONS.length + " 題",
    150,
    112
  );

  text(
    "時間：" + formatTime(getSeconds()),
    width - 120,
    112
  );

  drawProgressBar();

  fill("#FFFFFF");
  rect(80, 150, 640, 205, 20);

  fill("#3C9D70");
  ellipse(width / 2, 225, 125, 125);

  drawGarbageIcon(
    question.type,
    width / 2,
    225,
    90
  );

  fill("#245C4A");
  textSize(23);
  text(question.question, width / 2, 320);

  drawAnswerButtons(question);

  if (answered) {
    drawFeedback(question);
  } else {
    fill("#6B8178");
    textSize(15);
    text("請選擇一個答案", width / 2, 585);
  }
}

function drawProgressBar() {
  var x = 220;
  var y = 135;
  var w = 360;
  var h = 10;

  fill("#C9DDD2");
  rect(x, y, w, h, 5);

  fill("#3C9D70");
  rect(
    x,
    y,
    w * ((questionIndex + 1) / QUESTIONS.length),
    h,
    5
  );
}

function drawAnswerButtons(question) {
  var i;
  var x;
  var y;

  for (i = 0; i < 4; i++) {
    x = i % 2 === 0 ? 105 : 415;
    y = i < 2 ? 380 : 450;

    if (answered) {
      if (i === question.answer) {
        fill("#BDEDCB");
      } else if (i === selectedAnswer) {
        fill("#FFC7C7");
      } else {
        fill("#E8E8E8");
      }
    } else {
      fill("#FFFFFF");
    }

    stroke("#A7C4B5");
    strokeWeight(2);
    rect(x, y, 280, 55, 12);

    noStroke();
    fill("#245C4A");
    textSize(17);
    text(
      (i + 1) + ". " + question.options[i],
      x + 140,
      y + 27
    );
  }
}

function drawFeedback(question) {
  var correct = selectedAnswer === question.answer;

  fill(correct ? "#278653" : "#C33B3B");
  textSize(21);
  text(correct ? "答對了！" : "答錯了！", width / 2, 525);

  fill("#5B6E66");
  textSize(15);
  text(
    "正確答案：" + question.options[question.answer],
    width / 2,
    555
  );

  textSize(14);
  text(question.explain, width / 2, 580);

  drawButton(
    questionIndex === QUESTIONS.length - 1
      ? "查看結果"
      : "下一題",
    width / 2 - 100,
    615,
    200,
    48,
    "#3C9D70"
  );
}

function drawResultScreen() {
  drawHeader("測驗結果");

  fill("#245C4A");
  textSize(32);
  text("恭喜完成測驗！", width / 2, 145);

  fill("#3C9D70");
  textSize(29);
  text(
    "答對 " + score + " / " + QUESTIONS.length + " 題",
    width / 2,
    210
  );

  fill("#F2B83F");
  textSize(43);
  text(getStars(), width / 2, 275);

  fill("#5B6E66");
  textSize(20);
  text(
    "完成時間：" + formatTime(finalTime),
    width / 2,
    330
  );

  fill("#333333");
  textSize(18);
  text("答題結果", width / 2, 390);

  drawResultList();

  drawButton(
    "再玩一次",
    width / 2 - 120,
    585,
    240,
    58,
    "#3C9D70"
  );
}

function drawResultList() {
  var i;
  var x;
  var y;
  var originalIndex;
  var correct;

  for (i = 0; i < questionOrder.length; i++) {
    x = 155 + (i % 4) * 130;
    y = 425 + floor(i / 4) * 42;

    originalIndex = questionOrder[i];
    correct = answerResults[i] === QUESTIONS[originalIndex].answer;

    fill(correct ? "#BDEDCB" : "#FFC7C7");
    rect(x, y, 110, 30, 8);

    fill("#333333");
    textSize(13);
    text(
      "第 " + (i + 1) + " 題 " + (correct ? "答對" : "答錯"),
      x + 55,
      y + 15
    );
  }
}

function drawButton(label, x, y, w, h, color) {
  fill(color);
  noStroke();
  rect(x, y, w, h, 12);

  fill("#FFFFFF");
  textSize(20);
  text(label, x + w / 2, y + h / 2);
}

// -------------------------
// 垃圾圖示
// -------------------------

function drawGarbageIcon(type, x, y, size) {
  push();
  translate(x, y);

  stroke("#FFFFFF");
  strokeWeight(4);
  fill("#FFFFFF");

  if (type === "bottle") {
    rect(-20, -30, 40, 62, 9);
    rect(-13, -45, 26, 15, 4);

    fill("#3C9D70");
    noStroke();
    rect(-11, -8, 22, 24, 4);
  }

  if (type === "banana") {
    noFill();
    stroke("#FFE38A");
    strokeWeight(15);
    arc(0, 0, 78, 62, 0.15, PI - 0.15);

    stroke("#FFFFFF");
    strokeWeight(4);
    point(-35, 5);
  }

  if (type === "battery") {
    fill("#FFFFFF");
    noStroke();
    rect(-25, -30, 50, 60, 8);
    rect(-9, -43, 18, 13, 3);

    fill("#3C9D70");
    rect(-7, -13, 14, 28, 3);

    fill("#3C9D70");
    textSize(18);
    text("+", -13, -3);
    text("-", 13, -3);
  }

  if (type === "can") {
    fill("#FFFFFF");
    noStroke();
    ellipse(0, -28, 48, 15);
    rect(-24, -28, 48, 52);
    ellipse(0, 24, 48, 15);

    fill("#3C9D70");
    rect(-11, -3, 22, 6, 2);
  }

  if (type === "glass") {
    fill("#FFFFFF");
    noStroke();
    rect(-22, -28, 44, 58, 8);
    ellipse(0, -28, 44, 14);

    fill("#3C9D70");
    ellipse(0, -30, 26, 7);

    stroke("#3C9D70");
    strokeWeight(3);
    line(-15, -5, 15, -5);
  }

  if (type === "tissue") {
    fill("#FFFFFF");
    noStroke();
    rect(-32, -22, 64, 45, 8);

    fill("#E8E8E8");
    arc(0, -20, 30, 28, PI, TWO_PI);

    stroke("#3C9D70");
    strokeWeight(3);
    line(-15, 2, 15, 2);
  }

  if (type === "food") {
    fill("#FFFFFF");
    noStroke();
    rect(-32, -5, 64, 30, 6);
    ellipse(0, -5, 64, 20);

    fill("#3C9D70");
    ellipse(-15, -5, 9, 9);
    ellipse(5, -8, 9, 9);
    ellipse(19, -2, 9, 9);
  }

  if (type === "cup") {
    fill("#FFFFFF");
    noStroke();
    quad(-25, -28, 25, -28, 17, 30, -17, 30);

    noFill();
    stroke("#3C9D70");
    strokeWeight(4);
    arc(27, 0, 28, 34, -HALF_PI, HALF_PI);
  }

  pop();
}

// -------------------------
// 取得目前題目
// -------------------------

function getCurrentQuestion() {
  return QUESTIONS[questionOrder[questionIndex]];
}

// -------------------------
// 互動
// -------------------------

function mousePressed() {
  if (screen === "start") {
    if (
      mouseX > width / 2 - 130 &&
      mouseX < width / 2 + 130 &&
      mouseY > 470 &&
      mouseY < 535
    ) {
      startQuiz();
    }

    return;
  }

  if (screen === "quiz") {
    if (!answered) {
      chooseAnswer();
    } else {
      if (
        mouseX > width / 2 - 100 &&
        mouseX < width / 2 + 100 &&
        mouseY > 615 &&
        mouseY < 665
      ) {
        nextQuestion();
      }
    }

    return;
  }

  if (screen === "result") {
    if (
      mouseX > width / 2 - 120 &&
      mouseX < width / 2 + 120 &&
      mouseY > 585 &&
      mouseY < 645
    ) {
      startQuiz();
    }
  }
}

function chooseAnswer() {
  var i;
  var x;
  var y;
  var currentQuestion;

  currentQuestion = getCurrentQuestion();

  for (i = 0; i < 4; i++) {
    x = i % 2 === 0 ? 105 : 415;
    y = i < 2 ? 380 : 450;

    if (
      mouseX > x &&
      mouseX < x + 280 &&
      mouseY > y &&
      mouseY < y + 55
    ) {
      selectedAnswer = i;
      answered = true;

      answerResults[questionIndex] = i;

      if (i === currentQuestion.answer) {
        score++;
        playCorrectSound();
      } else {
        playWrongSound();
      }

      return;
    }
  }
}

function nextQuestion() {
  questionIndex++;

  if (questionIndex >= QUESTIONS.length) {
    finalTime = getSeconds();
    screen = "result";
  } else {
    selectedAnswer = -1;
    answered = false;
  }
}

function keyPressed() {
  if (screen === "start" && keyCode === ENTER) {
    startQuiz();
  }

  if (screen === "quiz") {
    if (!answered && key >= "1" && key <= "4") {
      selectedAnswer = int(key) - 1;
      answered = true;

      answerResults[questionIndex] = selectedAnswer;

      if (
        selectedAnswer === getCurrentQuestion().answer
      ) {
        score++;
        playCorrectSound();
      } else {
        playWrongSound();
      }
    }

    if (answered && keyCode === ENTER) {
      nextQuestion();
    }
  }

  if (screen === "result" && keyCode === ENTER) {
    startQuiz();
  }
}

function touchStarted() {
  mousePressed();
  return false;
}

// -------------------------
// 遊戲初始化
// -------------------------

function startQuiz() {
  screen = "quiz";
  questionIndex = 0;
  selectedAnswer = -1;
  answered = false;
  score = 0;
  finalTime = 0;
  startTime = millis();
  answerResults = [];

  questionOrder = [];

  for (var i = 0; i < QUESTIONS.length; i++) {
    questionOrder.push(i);
  }

  shuffleArray(questionOrder);

  initSound();
}

function shuffleArray(array) {
  var i;
  var j;
  var temp;

  for (i = array.length - 1; i > 0; i--) {
    j = floor(random(i + 1));

    temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

// -------------------------
// 計時器
// -------------------------

function getSeconds() {
  if (startTime === 0) {
    return 0;
  }

  if (screen === "result") {
    return finalTime;
  }

  return floor((millis() - startTime) / 1000);
}

function formatTime(seconds) {
  var minutes = floor(seconds / 60);
  var remaining = seconds % 60;

  return nf(minutes, 2) + ":" + nf(remaining, 2);
}

function getStars() {
  if (score === 8) {
    return "★★★★★";
  }

  if (score >= 6) {
    return "★★★★☆";
  }

  if (score >= 4) {
    return "★★★☆☆";
  }

  if (score >= 2) {
    return "★★☆☆☆";
  }

  return "★☆☆☆☆";
}

// -------------------------
// 音效
// -------------------------

function initSound() {
  try {
    if (typeof userStartAudio === "function") {
      userStartAudio();
    }

    soundReady = true;
  } catch (error) {
    soundReady = false;
    soundFailed = true;
  }
}

function playCorrectSound() {
  if (!soundReady || soundFailed) {
    return;
  }

  try {
    var osc1 = new p5.Oscillator("sine");
    var osc2 = new p5.Oscillator("sine");

    osc1.freq(660);
    osc2.freq(880);

    osc1.amp(0.15, 0.01);
    osc2.amp(0.12, 0.01);

    osc1.start();
    osc2.start();

    osc1.amp(0, 0.18);
    osc2.amp(0, 0.25);

    osc1.stop(0.2);
    osc2.stop(0.28);
  } catch (error) {
    soundFailed = true;
  }
}

function playWrongSound() {
  if (!soundReady || soundFailed) {
    return;
  }

  try {
    var osc = new p5.Oscillator("sawtooth");

    osc.freq(180);
    osc.amp(0.15, 0.01);
    osc.start();
    osc.amp(0, 0.25);
    osc.stop(0.3);
  } catch (error) {
    soundFailed = true;
  }
}