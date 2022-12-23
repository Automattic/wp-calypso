export default `#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 resolution;
uniform float time;

vec3 rand3(vec3 p) {
	vec3 q = vec3(
		dot(p, vec3(127.1, 311.7, 74.7)),
		dot(p, vec3(269.5, 183.3, 246.1)),
		dot(p, vec3(113.5, 271.9, 124.6))
		);

	return fract(sin(q) * 43758.5453123);
}

void main() {
	vec2 uv = gl_FragCoord.xy/resolution.xy;
	
	uv += vec2(-.05, -.3);
	uv.y /= uv.x * 2.;
	
	vec2 c_uv = uv - .3;
	
	float c = sin(-1. * time + 100. * distance( c_uv, vec2(0.) )) / 2. + .5;
	c += rand3(vec3(c_uv, 0.)).g * .5 - .25;
	
	float c2 = fract(-.1 * time + 13. * distance( c_uv, vec2(0.) ));
	c2 += rand3(vec3(c_uv, 0.)).r * .5 - .25;
	
	c = c + c2 - 2.*c*c2; //xor
	
	c = step(.45, c);
	
	vec3 color1 = vec3(0.658823529411765, 0.854901960784314, 1);
	vec3 color2 = vec3(0.058823529411765, 0.098039215686275, 0.796078431372549);
	
	vec3 col = mix(color1, color2, c);

  gl_FragColor = vec4(col,1.0); 
}`;
