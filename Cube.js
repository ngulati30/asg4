class Cube {
  constructor() {
    this.type = "cube";
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.textureNum = -1;
  }

  render() {
    //var xy = this.position;
    var rgba = this.color;
    //var size = this.size;

    // pass the texture number
    gl.uniform1i(u_whichTexture, this.textureNum);

    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    // Pass the matrix of a point to u_ModelMatrix variable
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // front of cube
    drawTriangle3DUVNormal(
      [0, 0, 0, 1, 1, 0, 1, 0, 0],
      [0, 0, 1, 1, 1, 0],
      [0, 0, -1, 0, 0, -1, 0, 0, -1]
    );
    drawTriangle3DUVNormal(
      [0, 0, 0, 0, 1, 0, 1, 1, 0],
      [0, 0, 0, 1, 1, 1],
      [0, 0, -1, 0, 0, -1, 0, 0, -1]
    );

    // Pass the color of a point to u_FragColor variable
    // gl.uniform4f(
    //   u_FragColor,
    //   rgba[0] * 0.9,
    //   rgba[1] * 0.9,
    //   rgba[2] * 0.9,
    //   rgba[3]
    // );

    // top
    drawTriangle3DUVNormal(
      [0, 1, 0, 0, 1, 1, 1, 1, 1],
      [0, 0, 0, 1, 1, 1],
      [0, 1, 0, 0, 1, 0, 0, 1, 0]
    );
    drawTriangle3DUVNormal(
      [0, 1, 0, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 0],
      [0, 1, 0, 0, 1, 0, 0, 1, 0]
    );

    // Pass the color of a point to u_FragColor variable
    // gl.uniform4f(
    //   u_FragColor,
    //   rgba[0] * 0.8,
    //   rgba[1] * 0.8,
    //   rgba[2] * 0.8,
    //   rgba[3]
    // );

    // right
    gl.uniform4f(
      u_FragColor,
      rgba[0] * 0.8,
      rgba[1] * 0.8,
      rgba[2] * 0.8,
      rgba[3]
    );
    drawTriangle3DUVNormal(
      [1, 1, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 1],
      [1, 0, 0, 1, 0, 0, 1, 0, 0]
    );
    drawTriangle3DUVNormal(
      [1, 0, 0, 1, 1, 1, 1, 0, 1],
      [0, 0, 1, 1, 1, 0],
      [1, 0, 0, 1, 0, 0, 1, 0, 0]
    );

    // left
    // gl.uniform4f(
    //   u_FragColor,
    //   rgba[0] * 0.7,
    //   rgba[1] * 0.7,
    //   rgba[2] * 0.7,
    //   rgba[3]
    // );
    drawTriangle3DUVNormal(
      [0, 1, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 0, 1, 1, 1],
      [-1, 0, 0, -1, 0, 0, -1, 0, 0]
    );
    drawTriangle3DUVNormal(
      [0, 0, 0, 0, 1, 1, 0, 0, 1],
      [0, 0, 1, 1, 1, 0],
      [-1, 0, 0, -1, 0, 0, -1, 0, 0]
    );

    // bottom
    // gl.uniform4f(
    //   u_FragColor,
    //   rgba[0] * 0.6,
    //   rgba[1] * 0.6,
    //   rgba[2] * 0.6,
    //   rgba[3]
    // );
    drawTriangle3DUVNormal(
      [0, 0, 0, 0, 0, 1, 1, 0, 1],
      [0, 0, 0, 1, 1, 1],
      [0, -1, 0, 0, -1, 0, 0, -1, 0]
    );
    drawTriangle3DUVNormal(
      [0, 0, 0, 1, 0, 1, 1, 0, 0],
      [0, 0, 1, 1, 1, 0],
      [0, -1, 0, 0, -1, 0, 0, -1, 0]
    );

    // back
    // gl.uniform4f(
    //   u_FragColor,
    //   rgba[0] * 0.5,
    //   rgba[1] * 0.5,
    //   rgba[2] * 0.5,
    //   rgba[3]
    // );
    drawTriangle3DUVNormal(
      [0, 0, 1, 1, 1, 1, 1, 0, 1],
      [0, 0, 0, 1, 1, 1],
      [0, 0, 1, 0, 0, 1, 0, 0, 1]
    );
    drawTriangle3DUVNormal(
      [0, 0, 1, 0, 1, 1, 1, 1, 1],
      [0, 0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0, 1, 0, 0, 1]
    );
  }
}
