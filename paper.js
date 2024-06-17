class Paper {
  constructor(x, y, w, h) {
    this.pos = createVector(x, y);
    this.w = w;
    this.h = h;
    //CenterMode
    this.posA = createVector(-this.w / 2, -this.h / 2);
    this.posB = createVector(this.posA.x + this.w, this.posA.y);
    this.posC = createVector(this.posA.x + this.w, this.posA.y + this.h);
    this.posD = createVector(this.posA.x, this.posA.y + this.h);
    //CornerMode
    // this.posA = createVector(this.pos.x, this.pos.y);
    // this.posB = createVector(this.posA.x + this.w, this.posA.y);
    // this.posC = createVector(this.posB.x, this.posA.y + this.h);
    // this.posD = createVector(this.posA.x, this.posC.y);

    this.posArr = [this.posA, this.posB, this.posC, this.posD];
    this.walls = [];
    this.generateWalls();

    // this.stdNum = float(random(0, 4)) | 0;
    this.stdNum = 0;
    this.stdPos = this.posArr[this.stdNum];
    this.vertices = [];
    for (let i = 0; i < this.posArr.length; i++) {
      this.vertices.push(this.posArr[(i + this.stdNum) % this.posArr.length]);
    }
    this.vertices.push(this.stdPos);

    this.state = 0;
    this.leftWall = this.stdNum;
    this.rightWall = (this.stdNum + 3) % 4;
    this.leftWall_ = (this.stdNum + 1) % 4;
    this.rightWall_ = (this.stdNum + 2) % 4;
    this.leftWallCheck = 0;
    this.rightWallCheck = 0;
    this.leftWallCheck_ = 0;
    this.rightWallCheck_ = 0;
    this.wallArr = [
      this.leftWall,
      this.rightWall,
      this.leftWall_,
      this.rightWall_,
    ];
    this.checkArr = [
      this.leftWallCheck,
      this.rightWallCheck,
      this.leftWallCheck_,
      this.rightWallCheck_,
    ];

    this.stripes = [];
    // const stripeSpan = int(random(2, 10));
    const stripeSpan = 6;
    for (let i = 0; i < this.w; i += this.w / stripeSpan) {
      this.stripes.push(
        new Stripe(
          this.posA.x + i + (this.w / stripeSpan) * 0.25,
          this.posA.y,
          (this.w / stripeSpan) * 0.5,
          this.h,
          this.stdNum,
          this
        )
      );
    }

    this.angle = 0;
    this.targetAngle = 0;
    this.targetPos = createVector(this.pos.x, this.pos.y);
    this.easeF = new EaseFloat(0, 0);
    this.easeV = new EaseVec2_2(this.pos, this.targetPos);

    this.ctrlPoint = new CtrlPoint(
      this.stdPos.x,
      this.stdPos.y,
      this.w,
      this.h,
      this.stdNum
    );
  }

  generateWalls() {
    for (let i = 0; i < this.posArr.length; i++) {
      let a = this.posArr[i];
      let b = this.posArr[(i + 1) % this.posArr.length];
      this.walls.push(new Wall(a, b));
    }
  }

  perpendicularLine(a, b) {
    let n = createVector(b.y - a.y, a.x - b.x);
    return n;
  }

  reflectPoint(p, a, b) {
    // Compute vector AB and vector AP
    let ab = p5.Vector.sub(b, a);
    let ap = p5.Vector.sub(p, a);

    // Project vector AP onto AB
    let abDotab = ab.dot(ab);
    let apDotab = ap.dot(ab);
    let projection = ab.copy();
    projection.mult(apDotab / abDotab);

    // Calculate the vector from P to its projection
    let toProjection = p5.Vector.sub(projection, ap);

    // Calculate the reflection point
    let reflection = p5.Vector.add(p, toProjection);
    reflection.add(toProjection); // P + 2(toProjection)

    return reflection;
  }

  getState(a, b, c, d) {
    return a * 8 + b * 4 + c * 2 + d * 1;
  }

  update() {
    this.ctrlPoint.loc = this.stdPos;

    let ray = this.ctrlPoint.ray;

    for (let i = 0; i < this.wallArr.length; i++) {
      if (ray.cast(this.walls[this.wallArr[i]])) {
        this.checkArr[i] = 1;
      } else {
        this.checkArr[i] = 0;
      }
    }
    this.state = this.getState(
      this.checkArr[0],
      this.checkArr[1],
      this.checkArr[2],
      this.checkArr[3]
    );
    // for (let i = 0; i < this.checkArr.length; i++) {
    //   text(this.checkArr[i], 100, 100 + 20 * i);
    // }
    // text(this.state, 100, 200);

    let pt_l = ray.cast(this.walls[this.leftWall]);
    let pt_r = ray.cast(this.walls[this.rightWall]);
    let pt_l_ = ray.cast(this.walls[this.leftWall_]);
    let pt_r_ = ray.cast(this.walls[this.rightWall_]);
    let p = 0;
    let p2 = 0;

    switch (this.state) {
      case 0: // 0000 noWall
        for (let i = 0; i < this.vertices.length; i++) {
          this.vertices[i] = this.reflectPoint(
            this.posArr[i % this.posArr.length],
            this.ctrlPoint.ray.pos,
            p5.Vector.add(this.ctrlPoint.ray.pos, this.ctrlPoint.ray.dir)
          );
        }
        break;
      case 12: // 1100 leftWall, rightWall
        this.vertices[0] = createVector(pt_l.x, pt_l.y);
        this.vertices[1] = this.posArr[(this.stdNum + 1) % this.posArr.length];
        this.vertices[2] = this.posArr[(this.stdNum + 2) % this.posArr.length];
        this.vertices[3] = this.posArr[(this.stdNum + 3) % this.posArr.length];
        this.vertices[4] = createVector(pt_r.x, pt_r.y);

        for (let s of this.stripes) {
          s.ctrlPoint.pos = this.reflectPoint(
            s.stdPos,
            this.ctrlPoint.ray.pos,
            p5.Vector.add(this.ctrlPoint.ray.pos, this.ctrlPoint.ray.dir)
          );
          if (s.state === 0) {
            s.backToPosition();
          }
        }
        break;
      case 9: // 1001 leftWall, rightWall_
        p = this.reflectPoint(
          this.posArr[(this.stdNum + 3) % this.posArr.length],
          this.ctrlPoint.ray.pos,
          p5.Vector.add(this.ctrlPoint.ray.pos, this.ctrlPoint.ray.dir)
        );
        this.vertices[0] = pt_l;
        this.vertices[1] = this.posArr[(this.stdNum + 1) % this.posArr.length];
        this.vertices[2] = this.posArr[(this.stdNum + 2) % this.posArr.length];
        this.vertices[3] = pt_r_;
        this.vertices[4] = p;

        for (let s of this.stripes) {
          if (this.vertices[0].x >= s.stdPos.x) {
            if (s.state === 6) {
              p = this.reflectPoint(
                s.posArr[(s.stdNum + 1) % s.posArr.length],
                this.ctrlPoint.ray.pos,
                p5.Vector.add(this.ctrlPoint.ray.pos, this.ctrlPoint.ray.dir)
              );
              s.vertices[0] = p;
              s.vertices[1] = ray.cast(s.walls[s.leftWall_]);
              s.vertices[2] = s.posArr[(s.stdNum + 2) % s.posArr.length];
              s.vertices[3] = s.posArr[(s.stdNum + 3) % s.posArr.length];
              s.vertices[4] = ray.cast(s.walls[s.rightWall]);
            }
            s.halfLeftCheck = true;
            s.ctrlPoint.pos = this.reflectPoint(
              s.stdPos,
              this.ctrlPoint.ray.pos,
              p5.Vector.add(this.ctrlPoint.ray.pos, this.ctrlPoint.ray.dir)
            );
          } else {
            if (s.state === 6) {
              p = this.reflectPoint(
                s.posArr[(s.stdNum + 1) % s.posArr.length],
                this.ctrlPoint.ray.pos,
                p5.Vector.add(this.ctrlPoint.ray.pos, this.ctrlPoint.ray.dir)
              );
              p2 = this.reflectPoint(
                s.posArr[(s.stdNum + 2) % s.posArr.length],
                this.ctrlPoint.ray.pos,
                p5.Vector.add(this.ctrlPoint.ray.pos, this.ctrlPoint.ray.dir)
              );
              s.vertices[0] = p2;
              s.vertices[1] = ray.cast(s.walls[s.leftWall_]);
              s.vertices[2] = s.posArr[(s.stdNum + 1) % s.posArr.length];
              s.vertices[3] = s.posArr[(s.stdNum + 0) % s.posArr.length];
              s.vertices[4] = ray.cast(s.walls[s.rightWall]);
            }
            s.halfLeftCheck = false;
            s.ctrlPoint.pos = this.reflectPoint(
              s.posArr[(s.stdNum + 3) % s.posArr.length],
              this.ctrlPoint.ray.pos,
              p5.Vector.add(this.ctrlPoint.ray.pos, this.ctrlPoint.ray.dir)
            );
            if (s.state === 0) {
              s.backToPosition();
            }
          }
        }
        break;
      case 6: // 0110 leftWall_, rightWall
        p = this.reflectPoint(
          this.posArr[(this.stdNum + 1) % this.posArr.length],
          this.ctrlPoint.ray.pos,
          p5.Vector.add(this.ctrlPoint.ray.pos, this.ctrlPoint.ray.dir)
        );
        this.vertices[0] = p;
        this.vertices[1] = pt_l_;
        this.vertices[2] = this.posArr[(this.stdNum + 2) % this.posArr.length];
        this.vertices[3] = this.posArr[(this.stdNum + 3) % this.posArr.length];
        this.vertices[4] = pt_r;

        for (let s of this.stripes) {
          s.ctrlPoint.pos = this.reflectPoint(
            s.stdPos,
            this.ctrlPoint.ray.pos,
            p5.Vector.add(this.ctrlPoint.ray.pos, this.ctrlPoint.ray.dir)
          );
        }
        break;
      case 10: // 1010 leftWall, leftWall_
        p = this.reflectPoint(
          this.posArr[(this.stdNum + 2) % this.posArr.length],
          this.ctrlPoint.ray.pos,
          p5.Vector.add(this.ctrlPoint.ray.pos, this.ctrlPoint.ray.dir)
        );
        p2 = this.reflectPoint(
          this.posArr[(this.stdNum + 3) % this.posArr.length],
          this.ctrlPoint.ray.pos,
          p5.Vector.add(this.ctrlPoint.ray.pos, this.ctrlPoint.ray.dir)
        );
        this.vertices[0] = pt_l;
        this.vertices[1] = this.posArr[(this.stdNum + 1) % this.posArr.length];
        this.vertices[2] = pt_l_;
        this.vertices[3] = p;
        this.vertices[4] = p2;

        for (let s of this.stripes) {
          if (s.state === 6) {
            s.ctrlPoint.pos = this.reflectPoint(
              s.posArr[(s.stdNum + 3) % s.posArr.length],
              this.ctrlPoint.ray.pos,
              p5.Vector.add(this.ctrlPoint.ray.pos, this.ctrlPoint.ray.dir)
            );
          } else {
            s.ctrlPoint.pos = this.reflectPoint(
              s.stdPos,
              this.ctrlPoint.ray.pos,
              p5.Vector.add(this.ctrlPoint.ray.pos, this.ctrlPoint.ray.dir)
            );
          }
        }
        break;
      case 3: // 0011 leftWall_, rightWall_
        p = this.reflectPoint(
          this.posArr[(this.stdNum + 3) % this.posArr.length],
          this.ctrlPoint.ray.pos,
          p5.Vector.add(this.ctrlPoint.ray.pos, this.ctrlPoint.ray.dir)
        );
        p2 = this.reflectPoint(
          this.posArr[(this.stdNum + 1) % this.posArr.length],
          this.ctrlPoint.ray.pos,
          p5.Vector.add(this.ctrlPoint.ray.pos, this.ctrlPoint.ray.dir)
        );
        this.vertices[0] = p2;
        this.vertices[1] = pt_l_;
        this.vertices[2] = this.posArr[(this.stdNum + 2) % this.posArr.length];
        this.vertices[3] = pt_r_;
        this.vertices[4] = p;

        for (let s of this.stripes) {
          s.ctrlPoint.pos = this.reflectPoint(
            s.stdPos,
            this.ctrlPoint.ray.pos,
            p5.Vector.add(this.ctrlPoint.ray.pos, this.ctrlPoint.ray.dir)
          );
        }
        break;
      case 5: // 0101 rightWall, rightWall_
        p = this.reflectPoint(
          this.posArr[(this.stdNum + 2) % this.posArr.length],
          this.ctrlPoint.ray.pos,
          p5.Vector.add(this.ctrlPoint.ray.pos, this.ctrlPoint.ray.dir)
        );
        p2 = this.reflectPoint(
          this.posArr[(this.stdNum + 1) % this.posArr.length],
          this.ctrlPoint.ray.pos,
          p5.Vector.add(this.ctrlPoint.ray.pos, this.ctrlPoint.ray.dir)
        );
        this.vertices[0] = p2;
        this.vertices[1] = p;
        this.vertices[2] = pt_r_;
        this.vertices[4] = pt_r;
        this.vertices[3] = this.posArr[(this.stdNum + 3) % this.posArr.length];

        for (let s of this.stripes) {
          s.ctrlPoint.pos = this.reflectPoint(
            s.stdPos,
            this.ctrlPoint.ray.pos,
            p5.Vector.add(this.ctrlPoint.ray.pos, this.ctrlPoint.ray.dir)
          );
        }
        break;
    }

    //원형 범위
    this.bE = this.posArr[(this.stdNum + 2) % this.posArr.length];
    this.bE_size = sqrt(this.w * this.w + this.h * this.h) * 2;
    this.mE = this.posArr[this.stdNum ^ 1];
    this.mE_size = this.w * 2;
    this.sE = this.posArr[(3 - this.stdNum) % this.posArr.length];
    this.sE_size = this.h * 2;

    if (debugMode) {
      push();
      noFill();
      stroke(0);
      ellipse(this.bE.x, this.bE.y, this.bE_size);
      ellipse(this.mE.x, this.mE.y, this.mE_size);
      ellipse(this.sE.x, this.sE.y, this.sE_size);
      pop();
    }
  }

  display() {
    if (frameCount % frameThreshold == 0 && playMode) {
      let randNum = int(random(3));
      let randomLoc = new p5.Vector();
      let randomRad = 0;
      if (randNum === 0) {
        //큰 원 랜덤
        randomLoc = createVector(this.bE.x, this.bE.y);
        randomRad = this.bE_size / 4;
      } else if (randNum === 1) {
        //중간 원 랜덤
        randomLoc = createVector(this.mE.x, this.mE.y);
        randomRad = this.mE_size / 4;
      } else {
        //작은 원 랜덤
        randomLoc = createVector(this.sE.x, this.sE.y);
        randomRad = this.sE_size / 4;
      }
      let theta = random(TWO_PI);
      let radius = sqrt(random()) * randomRad;
      let randomPos = createVector(
        randomLoc.x + radius * cos(theta),
        randomLoc.y + radius * sin(theta)
      );
      this.ctrlPoint.targetPos.set(randomPos.x, randomPos.y);
      this.ctrlPoint.ease.update(this.ctrlPoint.targetPos);
      this.targetAngle = random(TWO_PI);
      this.targetPos.set(
        random(this.w, width - this.w),
        random(this.h, height - this.h)
      );
      this.easeV.update(this.targetPos);
      this.easeF.update_f(this.targetAngle);
    }
    this.easeV.easeVec2(1.0);
    this.angle = this.easeF.easeFloat(1.0, this.targetAngle);
    sourceGraphics.push();
    sourceGraphics.translate(this.pos.x, this.pos.y);
    sourceGraphics.rotate(this.angle);
    sourceGraphics.noStroke();
    this.ctrlPoint.display();
    this.ctrlPoint.update();
    this.display_underPaper();
    for (let s of this.stripes) {
      s.display_underPaper();
    }
    this.display_overPaper();
    for (let s of this.stripes) {
      s.display_overPaper();
    }

    for (let s of this.stripes) {
      // s.display();
      // s.display_underPaper();
      // s.display_overPaper();
      s.ctrlPoint.display();
      s.ctrlPoint.update();
      s.update(this.ctrlPoint.ray);
    }
    sourceGraphics.pop();
  }

  display_underPaper() {
    sourceGraphics.push();
    sourceGraphics.fill(255);
    sourceGraphics.beginShape();
    for (let i = 0; i < this.vertices.length; i++) {
      sourceGraphics.vertex(this.vertices[i].x, this.vertices[i].y);
    }
    sourceGraphics.endShape(CLOSE);
    if (debugMode) {
      for (let w of this.walls) {
        w.display();
      }
      for (let i = 0; i < this.vertices.length; i++) {
        sourceGraphics.ellipse(this.vertices[i].x, this.vertices[i].y, 10);
        sourceGraphics.fill(0);
        sourceGraphics.text(i, this.vertices[i].x, this.vertices[i].y - 20);
        sourceGraphics.fill(255);
      }
    }
    sourceGraphics.pop();
  }

  display_overPaper() {
    sourceGraphics.push();
    sourceGraphics.fill(255);
    sourceGraphics.beginShape();
    switch (this.state) {
      case 0: // 0000 noWall
        for (let i = 0; i < this.vertices.length; i++) {
          sourceGraphics.vertex(this.vertices[i].x, this.vertices[i].y);
        }
        break;
      case 12: // 1100 leftWall, rightWall
        sourceGraphics.vertex(this.ctrlPoint.pos.x, this.ctrlPoint.pos.y);
        sourceGraphics.vertex(this.vertices[0].x, this.vertices[0].y);
        sourceGraphics.vertex(this.vertices[4].x, this.vertices[4].y);
        break;
      case 9: // 1001 leftWall, rightWall_
        sourceGraphics.vertex(this.ctrlPoint.pos.x, this.ctrlPoint.pos.y);
        sourceGraphics.vertex(this.vertices[0].x, this.vertices[0].y);
        sourceGraphics.vertex(this.vertices[3].x, this.vertices[3].y);
        sourceGraphics.vertex(this.vertices[4].x, this.vertices[4].y);
        break;
      case 6: // 0110 leftWall_, rightWall
        sourceGraphics.vertex(this.ctrlPoint.pos.x, this.ctrlPoint.pos.y);
        sourceGraphics.vertex(this.vertices[0].x, this.vertices[0].y);
        sourceGraphics.vertex(this.vertices[1].x, this.vertices[1].y);
        sourceGraphics.vertex(this.vertices[4].x, this.vertices[4].y);
        break;
      case 10: // 1010 leftWall, leftWall_
        sourceGraphics.vertex(this.ctrlPoint.pos.x, this.ctrlPoint.pos.y);
        sourceGraphics.vertex(this.vertices[0].x, this.vertices[0].y);
        sourceGraphics.vertex(this.vertices[2].x, this.vertices[2].y);
        sourceGraphics.vertex(this.vertices[3].x, this.vertices[3].y);
        sourceGraphics.vertex(this.vertices[4].x, this.vertices[4].y);
        break;
      case 3: // 0011 leftWall_, rightWall_
        sourceGraphics.vertex(this.ctrlPoint.pos.x, this.ctrlPoint.pos.y);
        sourceGraphics.vertex(this.vertices[0].x, this.vertices[0].y);
        sourceGraphics.vertex(this.vertices[1].x, this.vertices[1].y);
        sourceGraphics.vertex(this.vertices[3].x, this.vertices[3].y);
        sourceGraphics.vertex(this.vertices[4].x, this.vertices[4].y);
        break;
      case 5: // 0101 rightWall, rightWall_
        sourceGraphics.vertex(this.ctrlPoint.pos.x, this.ctrlPoint.pos.y);
        sourceGraphics.vertex(this.vertices[0].x, this.vertices[0].y);
        sourceGraphics.vertex(this.vertices[1].x, this.vertices[1].y);
        sourceGraphics.vertex(this.vertices[2].x, this.vertices[2].y);
        sourceGraphics.vertex(this.vertices[4].x, this.vertices[4].y);
        break;
    }
    sourceGraphics.endShape(CLOSE);
    sourceGraphics.pop();
  }
}
