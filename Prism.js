class TriangularPrism {
  constructor() {
    this.type = "triangularPrism";
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
  }

  render() {
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // Base and top coordinates
    const base = -0.5,
      top = 0.5;
    const points = [
      { pos: [0, base, -1] }, // base front vertex
      { pos: [-1, base, 1] }, // base left vertex
      { pos: [1, base, 1] }, // base right vertex
      { pos: [0, top, 0] }, // top vertex
    ];

    drawTriangle3D([...points[0].pos, ...points[1].pos, ...points[2].pos]);

    // Draw sides
    for (let i = 1; i <= 3; i++) {
      const current = points[i % 3];
      const next = points[(i + 1) % 3];
      drawTriangle3D([...points[3].pos, ...current.pos, ...next.pos]);
    }

    // Draw vertical faces connecting the base to the top
    points.slice(0, 3).forEach((point, i) => {
      const next = points[(i + 1) % 3];
      drawTriangle3D([...point.pos, ...next.pos, ...points[3].pos]);
      drawTriangle3D([...point.pos, ...next.pos, ...points[0].pos]);
    });
  }
}
