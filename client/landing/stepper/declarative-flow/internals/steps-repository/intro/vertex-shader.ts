export default `attribute vec3 position;

void main() {
  vec4 position2 = vec4(position, 1.0);
  gl_Position = position2;
}`;
