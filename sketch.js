let Shader;
let sourceGraphics, shaderGrapgics;
let span = 600;

// function preload() {
//   Shader = loadShader("shader.vert", "shader.frag");
//   superNormale_rg = loadFont("/assets/fonts/SupernormaleEigStaCon W00 Rg.ttf");
//   superNormale_bd = loadFont("/assets/fonts/SupernormaleEigSta W00 Bold.ttf");
//   playIcon = loadImage("./assets/images/playIcon.png");
//   pauseIcon = loadImage("./assets/images/pauseIcon.png");
// }

let superNormale_rg, superNormale_bd;
let playIcon, pauseIcon;

let paper = [];
let cols = 12;
let rows = 12;
let debugMode = false;
let playMode = true;
let frameThreshold = 90;
let timePosterize = false;
let count = 0;

function setup() {
  Shader = loadShader("shader.vert", "shader.frag");
  superNormale_rg = loadFont("/assets/fonts/SupernormaleEigStaCon W00 Rg.ttf");
  superNormale_bd = loadFont("/assets/fonts/SupernormaleEigSta W00 Bold.ttf");
  playIcon = loadImage("./assets/images/playIcon.png");
  pauseIcon = loadImage("./assets/images/pauseIcon.png");
  createCanvas(windowWidth, windowHeight);
  sourceGraphics = createGraphics(width, height);
  shaderGrapgics = createGraphics(width, height, WEBGL);
  textFont(superNormale_rg);
  textAlign(CENTER, CENTER);
  textSize(16);
  for (let i = 0; i < cols + 1; i++) {
    for (let j = 0; j < rows + 1; j++) {
      paper.push(
        new Paper(
          (width / cols) * i,
          (height / rows) * j,
          (width / cols) * 2,
          (height / rows) * 2
        )
      );
    }
  }
  for (let i = 0; i < 1; i++) {
    paper.push(new Paper(width / 2, height / 2, 300, 200));
  }
}

function draw() {
  sourceGraphics.background(255);
  // background(100, 160, 255);
  // background(255);
  for (let i = 0; i < paper.length; i++) {
    paper[i].update();
    paper[i].display();
  }

  if (playMode) {
    sourceGraphics.image(pauseIcon, width - 80, 50, 34, 40);
  } else {
    sourceGraphics.image(playIcon, width - 80, 50, 34, 40);
  }

  shaderGrapgics.shader(Shader);
  Shader.setUniform("u_resolution", [width / width, height / height]);
  Shader.setUniform("u_time", millis() / 1000.0);
  Shader.setUniform("u_mouse", [mouseX / width, mouseY / height]);
  Shader.setUniform("u_tex", sourceGraphics);
  Shader.setUniform("u_span", span);

  shaderGrapgics.rect(0, 0, width, height);
  image(sourceGraphics, 0, 0);
  image(shaderGrapgics, 0, 0, width, height);
}

function keyPressed() {
  if (keyCode === 68) {
    debugMode = !debugMode;
  }
  if (keyCode === 48) {
    for (p of paper) {
      p.ctrlPoint.targetPos.set(
        p.ctrlPoint.loc.x +
          floor(1 - (2 * abs(p.stdNum % 3)) / (abs(p.stdNum % 3) + 0.00001)) *
            p.ctrlPoint.size.x *
            0.01,
        p.ctrlPoint.loc.y +
          (-1) ** floor(p.stdNum / 2) * p.ctrlPoint.size.y * 0.01
      );
      p.ctrlPoint.ease.update(p.ctrlPoint.targetPos);
    }
  }
  if (keyCode === 57) {
    for (p of paper) {
      p.ctrlPoint.targetPos.set(
        p.ctrlPoint.loc.x +
          floor(1 - (2 * abs(p.stdNum % 3)) / (abs(p.stdNum % 3) + 0.00001)) *
            p.ctrlPoint.size.x *
            0.1,
        p.ctrlPoint.loc.y +
          (-1) ** floor(p.stdNum / 2) * p.ctrlPoint.size.y * 0.1
      );
      p.ctrlPoint.ease.update(p.ctrlPoint.targetPos);
    }
  }
  if (keyCode === 49) {
    for (let p of paper) {
      let randNum = int(random(3));
      let randomLoc = new p5.Vector();
      let maxRad = 0;
      let minRad = p.h / 4;
      if (randNum === 0) {
        //큰 원 랜덤
        randomLoc = createVector(p.bE.x, p.bE.y);
        maxRad = p.bE_size / 4;
      } else if (randNum === 1) {
        //중간 원 랜덤
        randomLoc = createVector(p.mE.x, p.mE.y);
        maxRad = p.mE_size / 4;
      } else {
        //작은 원 랜덤
        randomLoc = createVector(p.sE.x, p.sE.y);
        maxRad = p.sE_size / 4;
      }
      let theta = random(TWO_PI);
      let radius = sqrt(random()) * (maxRad - minRad) + minRad;
      let randomPos = createVector(
        randomLoc.x + radius * cos(theta),
        randomLoc.y + radius * sin(theta)
      );
      p.ctrlPoint.targetPos.set(randomPos.x, randomPos.y);
      p.ctrlPoint.ease.update(p.ctrlPoint.targetPos);
    }
  }
  if (keyCode === 50) {
    for (let p of paper) {
      p.targetAngle = random(TWO_PI);
      p.easeF.update_f(p.targetAngle);
      // p.angle = p.ease.easeFloat(1, 20);
    }
  }
  if (keyCode === 51) {
    for (let p of paper) {
      p.targetPos.set(random(p.w, width - p.w), random(p.h, height - p.h));
      p.easeV.update(p.targetPos);
      // p.angle = p.ease.easeFloat(1, 20);
    }
  }
  if (keyCode === 80) {
    playMode = !playMode;
  }
  if (keyCode === 84) {
    timePosterize = !timePosterize;
  }
}

class CtrlPoint {
  constructor(x, y, w, h, stdNum = 0) {
    this.pos = createVector(x, y);
    this.loc = createVector(x, y);
    this.size = createVector(w, h);
    this.radius = 10;
    this.ray = new Ray(0, 0, 0);
    this.stdNum = stdNum;

    this.targetPos = createVector(
      this.loc.x +
        floor(
          1 - (2 * abs(this.stdNum % 3)) / (abs(this.stdNum % 3) + 0.00001)
        ) *
          this.size.x *
          0.01,
      this.loc.y + (-1) ** floor(this.stdNum / 2) * this.size.y * 0.01
    );

    this.ease = new EaseVec2(this.pos, this.targetPos);
  }

  perpendicularLine(a, b) {
    let n = createVector(b.y - a.y, a.x - b.x);
    return n;
  }

  update() {
    if (debugMode) {
      this.pos.set(mouseX, mouseY);
      // this.ease.easeVec2(1);
    } else {
      if (playMode) {
        if (frameCount % (frameThreshold / 45) == 0) {
          this.ease.easeVec2(3);
        }
      } else {
        if (frameCount % (frameThreshold / 45) == 0) {
          this.ease.easeVec2(0.5);
        }
      }
    }
    // this.pos.set(mouseX, mouseY);

    this.m = p5.Vector.add(this.loc, this.pos).div(2);
    this.n = this.perpendicularLine(this.loc, this.pos);
    this.ray.pos = p5.Vector.sub(
      this.m,
      this.n.normalize().mult(this.ray.length / 2)
    );
    this.ray.angle = this.n.heading();
    this.ray.update();
  }

  display() {
    // this.update();
    push();
    //
    if (debugMode) {
      ellipse(this.pos.x, this.pos.y, this.radius);
      fill(0);
      stroke(255);
      strokeWeight(2);
      text(
        `(${this.pos.x.toFixed(1)}, ${this.pos.y.toFixed(1)})`,
        this.pos.x + 10,
        this.pos.y + 10
      );
    }
    // ellipse(this.m.x, this.m.y, 5);
    // this.ray.update();
    if (debugMode) {
      stroke(0);
      strokeWeight(1);
      this.ray.display();
    }
    pop();
  }
}

class Ray {
  constructor(x, y, angle) {
    this.pos = createVector(x, y);
    this.angle = angle;
    this.dir = p5.Vector.fromAngle(this.angle);
    this.length = width * 2;
  }

  update() {
    this.dir = p5.Vector.fromAngle(this.angle);
    this.dir.setMag(this.length);
  }

  display() {
    // this.update();
    push();
    translate(this.pos.x, this.pos.y);
    line(0, 0, this.dir.x, this.dir.y);
    pop();
  }

  cast(wall) {
    const x1 = wall.posA.x;
    const y1 = wall.posA.y;
    const x2 = wall.posB.x;
    const y2 = wall.posB.y;

    const x3 = this.pos.x;
    const y3 = this.pos.y;
    const x4 = this.pos.x + this.dir.x;
    const y4 = this.pos.y + this.dir.y;

    const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (denominator === 0) {
      return;
    }
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator;
    if (t > 0 && t < 1 && u > 0) {
      const point = createVector();
      point.x = x1 + t * (x2 - x1);
      point.y = y1 + t * (y2 - y1);
      return point;
    } else {
      return;
    }
  }
}

class Wall {
  constructor(posA, posB) {
    this.posA = posA;
    this.posB = posB;
  }

  display() {
    line(this.posA.x, this.posA.y, this.posB.x, this.posB.y);
  }
}
