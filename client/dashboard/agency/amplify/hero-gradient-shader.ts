/**
 * Grainy gradient for direction A: domain-warped noise for big soft colour
 * shapes, stretched sideways for a slight motion smear, then heavy film grain.
 */
export type AmplifyGradientPalette = 'brand';

// Base, then three masses (top centre, bottom left, bottom right). A4A's
// blues from Brand OS (brands/a4a/color.yaml), on a light-blue base so the
// field stays blue to its corners.
export const GRADIENT_PALETTES: Record< AmplifyGradientPalette, string[] > = {
	brand: [ '#D6E8FF', '#72B3FF', '#72B3FF', '#0387FF' ],
};

export const GRADIENT_VERTEX = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
	vUv = aPosition * 0.5 + 0.5;
	gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

export const GRADIENT_FRAGMENT = `
precision highp float;
varying vec2 vUv;
uniform vec2 uSize;
uniform float uSeed;
uniform vec3 uBase;
uniform vec3 uOne;
uniform vec3 uTwo;
uniform vec3 uThree;

// Integer-style hash: no sine banding, so the grain reads as film, not a pattern.
float hash(vec2 p) {
	vec3 p3 = fract(vec3(p.xyx) * 0.1031);
	p3 += dot(p3, p3.yzx + 33.33);
	return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
	vec2 i = floor(p);
	vec2 f = fract(p);
	vec2 u = f * f * (3.0 - 2.0 * f);
	return mix(
		mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
		mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
		u.y
	);
}

// A soft colour mass: a wide ellipse, its edge pushed around by slow noise.
float mass(vec2 p, vec2 centre, vec2 radius) {
	vec2 d = (p - centre) / radius;
	return exp(-dot(d, d) * 1.6);
}

void main() {
	float aspect = uSize.x / uSize.y;
	vec2 p = vec2(vUv.x * aspect, vUv.y);
	// One slow warp, stretched sideways for a slight motion smear.
	vec2 warp = vec2(noise(p * vec2(0.9, 2.2) + uSeed), noise(p * vec2(0.9, 2.2) + uSeed + 7.3)) - 0.5;
	p += warp * vec2(0.55, 0.35);

	vec3 color = uBase;
	color = mix(color, uThree, mass(p, vec2(aspect * 0.78, 0.25), vec2(0.55 * aspect, 0.55)) * 0.9);
	color = mix(color, uTwo, mass(p, vec2(aspect * 0.18, 0.15), vec2(0.4 * aspect, 0.6)) * 0.95);
	color = mix(color, uOne, mass(p, vec2(aspect * 0.5, 0.85), vec2(0.42 * aspect, 0.5)));

	// Film grain: fine, even, a little stronger in the mid tones.
	float grain = hash(gl_FragCoord.xy + fract(uSeed) * 913.0) - 0.5;
	float luma = dot(color, vec3(0.299, 0.587, 0.114));
	color += grain * (0.11 + 0.07 * (1.0 - abs(luma - 0.5) * 2.0));

	gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}`;

export function hexToRgb( hex: string ): [ number, number, number ] {
	const value = parseInt( hex.slice( 1 ), 16 );
	return [ ( ( value >> 16 ) & 255 ) / 255, ( ( value >> 8 ) & 255 ) / 255, ( value & 255 ) / 255 ];
}
