class Stripe {
  constructor(x, y, w, h, sdtNum = 0, paper) {
    this.pos = createVector(x, y);
    this.w = w;
    this.h = h;
    //CenterMode
    // this.posA = createVector(this.pos.x - this.w / 2, this.pos.y - this.h / 2);
    // this.posB = createVector(this.posA.x + this.w, this.posA.y);
    // this.posC = createVector(this.posA.x + this.w, this.posA.y + this.h);
    // this.posD = createVector(this.posA.x, this.posA.y + this.h);
    //CornerMode
    this.posA = createVector(this.pos.x, this.pos.y);
    this.posB = createVector(this.posA.x + this.w, this.posA.y);
    this.posC = createVector(this.posB.x, this.posA.y + this.h);
    this.posD = createVector(this.posA.x, this.posC.y);

    this.posArr = [this.posA, this.posB, this.posC, this.posD];
    this.walls = [];
    this.generateWalls();

    // this.stdNum = float(random(0, 4)) | 0;
    this.stdNum = sdtNum;
    this.stdPos = this.posArr[this.stdNum];
    this.vertices = [];
    for (let i = 0; i < this.posArr.length; i++) {
      this.vertices.push(this.posArr[(i + this.stdNum) % this.posArr.length]);
    }
    this.vertices.push(this.stdPos);

    this.state = sdtNum;
    this.leftWall = this.stdNum;
    this.rightWall = (this.stdNum + 3) % 4;
    this.leftWall_ = (this.stdNum + 1) % 4;
    this.rightWall_ = (this.stdNum + 2) % 4;
    this.leftWallCheck = 0;
    this.rightWallCheck = 0;
    this.leftWallCheck_ = 0;
    this.rightWallCheck_ = 0;
    this.halfLeftCheck = false;
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

    this.paper = paper;
    this.underColorSet = color(0);
    this.underColor = this.underColorSet;
    // this.overColor = color(255, 0, 0);
    this.overColor = color(0);

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

  backToPosition() {
    this.vertices[0] = this.stdPos;
    this.vertices[1] = this.posArr[(this.stdNum + 1) % this.posArr.length];
    this.vertices[2] = this.posArr[(this.stdNum + 2) % this.posArr.length];
    this.vertices[3] = this.posArr[(this.stdNum + 3) % this.posArr.length];
    this.vertices[4] = this.stdPos;
  }

  getState(a, b, c, d) {
    return a * 8 + b * 4 + c * 2 + d * 1;
  }

  update(ray_) {
    this.ctrlPoint.loc = this.paper.stdPos;

    // let ray = this.paper.ctrlPoint.ray;
    let ray = ray_;
    this.ctrlPoint.ray.pos = ray.pos;
    this.ctrlPoint.ray.dir = ray.dir;

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

    this.paperState = this.paper.state;

    // for (let i = 0; i < this.checkArr.length; i++) {
    //   text(this.checkArr[i], 200, 100 + 20 * i);
    // }
    // text("state:" + this.state, 200, 200);
    // text("paperState:" + this.paperState, 200, 220);

    let pt_l = ray.cast(this.walls[this.leftWall]);
    let pt_r = ray.cast(this.walls[this.rightWall]);
    let pt_l_ = ray.cast(this.walls[this.leftWall_]);
    let pt_r_ = ray.cast(this.walls[this.rightWall_]);
    let p = 0;
    let p2 = 0;

    if (this.paperState !== 9) {
      this.halfLeftCheck = true;
    }

    switch (this.state) {
      case 0: // 0000 noWall
        if (this.paperState !== 12) {
          for (let i = 0; i < this.vertices.length; i++) {
            this.vertices[i] = this.reflectPoint(
              this.posArr[i % this.posArr.length],
              this.ctrlPoint.ray.pos,
              p5.Vector.add(this.ctrlPoint.ray.pos, this.ctrlPoint.ray.dir)
            );
          }
        } else {
          this.vertices[0] = this.stdPos;
          this.vertices[4] = this.stdPos;
        }
        break;
      case 12: // 1100 leftWall, rightWall
        this.vertices[0] = createVector(pt_l.x, pt_l.y);
        this.vertices[1] = this.posArr[(this.stdNum + 1) % this.posArr.length];
        this.vertices[2] = this.posArr[(this.stdNum + 2) % this.posArr.length];
        this.vertices[3] = this.posArr[(this.stdNum + 3) % this.posArr.length];
        this.vertices[4] = createVector(pt_r.x, pt_r.y);
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
        break;
      case 6: // 0110 leftWall_, rightWall
        if (
          (this.paperState === 9 && !this.halfLeftCheck) ||
          this.paperState === 10
        ) {
          p = this.reflectPoint(
            this.posArr[(this.stdNum + 3) % this.posArr.length],
            this.ctrlPoint.ray.pos,
            p5.Vector.add(this.ctrlPoint.ray.pos, this.ctrlPoint.ray.dir)
          );
          p2 = this.reflectPoint(
            this.posArr[(this.stdNum + 2) % this.posArr.length],
            this.ctrlPoint.ray.pos,
            p5.Vector.add(this.ctrlPoint.ray.pos, this.ctrlPoint.ray.dir)
          );
          this.vertices[0] = p2;
          this.vertices[1] = pt_l_;
          this.vertices[2] =
            this.posArr[(this.stdNum + 1) % this.posArr.length];
          this.vertices[3] = this.stdPos;
          this.vertices[4] = pt_r;
          // ellipse(p.x, p.y, 30);
        } else {
          p = this.reflectPoint(
            this.posArr[(this.stdNum + 1) % this.posArr.length],
            this.ctrlPoint.ray.pos,
            p5.Vector.add(this.ctrlPoint.ray.pos, this.ctrlPoint.ray.dir)
          );
          this.vertices[0] = p;
          this.vertices[1] = pt_l_;
          this.vertices[2] =
            this.posArr[(this.stdNum + 2) % this.posArr.length];
          this.vertices[3] =
            this.posArr[(this.stdNum + 3) % this.posArr.length];
          this.vertices[4] = pt_r;
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
        break;
      case 5: // 0101 rightWall, rightWall_
        if (this.paperState === 9 && !this.halfRightCheck) {
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
          this.vertices[0] = pt_r_;
          this.vertices[1] =
            this.posArr[(this.stdNum + 2) % this.posArr.length];
          this.vertices[2] =
            this.posArr[(this.stdNum + 1) % this.posArr.length];
          this.vertices[4] = pt_r;
          this.vertices[3] =
            this.posArr[(this.stdNum + 0) % this.posArr.length];
        } else {
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
          this.vertices[3] =
            this.posArr[(this.stdNum + 3) % this.posArr.length];
        }
        break;
    }

    if (debugMode) {
      text(this.halfLeftCheck, this.stdPos.x, this.stdPos.y - 20);
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
      // ellipse(this.bE.x, this.bE.y, this.bE_size);
      // ellipse(this.mE.x, this.mE.y, this.mE_size);
      // ellipse(this.sE.x, this.sE.y, this.sE_size);
      pop();
    }
  }

  display() {
    this.display_underPaper();
    // if (this.state !== 0) {
    this.display_overPaper();
    // }
    this.ctrlPoint.display();
    this.ctrlPoint.update();
  }

  display_underPaper() {
    sourceGraphics.push();
    sourceGraphics.fill(this.underColor);
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
        ellipse(this.vertices[i].x, this.vertices[i].y, 10);
        fill(0);
        text(i, this.vertices[i].x, this.vertices[i].y - 20);
        fill(255);
      }
    }
    sourceGraphics.pop();
  }

  display_overPaper() {
    sourceGraphics.push();
    sourceGraphics.fill(this.overColor);
    sourceGraphics.beginShape();
    switch (this.state) {
      case 0: // 0000 noWall
        if (this.halfLeftCheck && this.paperState !== 12) {
          for (let i = 0; i < this.vertices.length; i++) {
            sourceGraphics.vertex(this.vertices[i].x, this.vertices[i].y);
          }
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
        if (this.paperState !== 9) {
          sourceGraphics.vertex(this.ctrlPoint.pos.x, this.ctrlPoint.pos.y);
          sourceGraphics.vertex(this.vertices[0].x, this.vertices[0].y);
          sourceGraphics.vertex(this.vertices[1].x, this.vertices[1].y);
          sourceGraphics.vertex(this.vertices[2].x, this.vertices[2].y);
          sourceGraphics.vertex(this.vertices[4].x, this.vertices[4].y);
        } else {
          sourceGraphics.vertex(this.ctrlPoint.pos.x, this.ctrlPoint.pos.y);
          sourceGraphics.vertex(this.vertices[0].x, this.vertices[0].y);
          sourceGraphics.vertex(this.vertices[4].x, this.vertices[4].y);
        }
        break;
    }
    sourceGraphics.endShape(CLOSE);
    sourceGraphics.pop();
  }
}
