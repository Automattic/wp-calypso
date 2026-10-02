import { useEffect, useRef } from 'react';

const VERTEX_SHADER = `
attribute vec2 aPosition;
attribute vec2 aUv;
varying vec2 vUv;

void main() {
	vUv = aUv;
	gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uImage;
uniform vec2 uCanvasSize;
uniform vec2 uImageSize;
uniform float uZoom;
uniform float uStrength;
uniform float uScale;

float noise(vec2 position) {
	return fract(sin(dot(position, vec2(127.1, 311.7))) * 43758.5453);
}

float gaussianNoise(vec2 position) {
	float first = max(noise(position), 0.0001);
	float second = noise(position + vec2(19.19, 73.73));
	return sqrt(-2.0 * log(first)) * cos(6.2831853 * second);
}

vec2 imageUv(vec2 canvasUv) {
	float imageScale = uCanvasSize.y / uImageSize.y * uZoom;
	return (canvasUv - 0.5) * uCanvasSize / (uImageSize * imageScale) + 0.5;
}

vec3 sampleImage(vec2 canvasUv) {
	return texture2D(uImage, imageUv(canvasUv)).rgb;
}

void main() {
	vec3 original = sampleImage(vUv);
	float grain = gaussianNoise(floor(gl_FragCoord.xy / max(0.5, uScale)));
	gl_FragColor = vec4(clamp(original + vec3(grain * 0.18 * uStrength), 0.0, 1.0), 1.0);
}`;

function compileShader( gl: WebGLRenderingContext, type: number, source: string ) {
	const shader = gl.createShader( type );
	if ( ! shader ) {
		return null;
	}
	gl.shaderSource( shader, source );
	gl.compileShader( shader );
	if ( ! gl.getShaderParameter( shader, gl.COMPILE_STATUS ) ) {
		gl.deleteShader( shader );
		return null;
	}
	return shader;
}

export default function AmplifyHeroShader( {
	image,
	strength,
	scale,
	zoom,
}: {
	image: string;
	strength: number;
	scale: number;
	zoom: number;
} ) {
	const canvasRef = useRef< HTMLCanvasElement >( null );
	const drawRef = useRef< ( () => void ) | null >( null );
	const valuesRef = useRef( { strength, scale, zoom } );
	valuesRef.current = { strength, scale, zoom };

	useEffect( () => {
		const canvas = canvasRef.current;
		const gl = canvas?.getContext( 'webgl', { alpha: false, antialias: false } );
		if ( ! canvas || ! gl ) {
			return;
		}
		const vertex = compileShader( gl, gl.VERTEX_SHADER, VERTEX_SHADER );
		const fragment = compileShader( gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER );
		if ( ! vertex || ! fragment ) {
			if ( vertex ) {
				gl.deleteShader( vertex );
			}
			if ( fragment ) {
				gl.deleteShader( fragment );
			}
			return;
		}
		const program = gl.createProgram();
		const buffer = gl.createBuffer();
		const texture = gl.createTexture();
		if ( ! program || ! buffer || ! texture ) {
			gl.deleteShader( vertex );
			gl.deleteShader( fragment );
			return;
		}
		gl.attachShader( program, vertex );
		gl.attachShader( program, fragment );
		gl.linkProgram( program );
		if ( ! gl.getProgramParameter( program, gl.LINK_STATUS ) ) {
			gl.deleteShader( vertex );
			gl.deleteShader( fragment );
			gl.deleteProgram( program );
			gl.deleteBuffer( buffer );
			gl.deleteTexture( texture );
			return;
		}
		gl.useProgram( program );
		gl.bindBuffer( gl.ARRAY_BUFFER, buffer );
		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array( [ -1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, 1, 1, 1, 1 ] ),
			gl.STATIC_DRAW
		);
		const position = gl.getAttribLocation( program, 'aPosition' );
		const uv = gl.getAttribLocation( program, 'aUv' );
		gl.enableVertexAttribArray( position );
		gl.vertexAttribPointer( position, 2, gl.FLOAT, false, 16, 0 );
		gl.enableVertexAttribArray( uv );
		gl.vertexAttribPointer( uv, 2, gl.FLOAT, false, 16, 8 );
		gl.bindTexture( gl.TEXTURE_2D, texture );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
		gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, 1 );
		gl.uniform1i( gl.getUniformLocation( program, 'uImage' ), 0 );

		const source = new Image();
		const draw = () => {
			if ( ! source.complete || ! source.naturalWidth ) {
				return;
			}
			const bounds = canvas.getBoundingClientRect();
			const ratio = Math.min( window.devicePixelRatio || 1, 2 );
			const width = Math.max( 1, Math.round( bounds.width * ratio ) );
			const height = Math.max( 1, Math.round( bounds.height * ratio ) );
			if ( canvas.width !== width || canvas.height !== height ) {
				canvas.width = width;
				canvas.height = height;
			}
			gl.viewport( 0, 0, width, height );
			gl.uniform2f( gl.getUniformLocation( program, 'uCanvasSize' ), width, height );
			gl.uniform2f(
				gl.getUniformLocation( program, 'uImageSize' ),
				source.naturalWidth,
				source.naturalHeight
			);
			gl.uniform1f( gl.getUniformLocation( program, 'uZoom' ), valuesRef.current.zoom / 100 );
			gl.uniform1f(
				gl.getUniformLocation( program, 'uStrength' ),
				valuesRef.current.strength / 100
			);
			gl.uniform1f( gl.getUniformLocation( program, 'uScale' ), valuesRef.current.scale / 100 );
			gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
		};
		drawRef.current = draw;
		source.onload = () => {
			gl.bindTexture( gl.TEXTURE_2D, texture );
			gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source );
			draw();
		};
		source.src = image;
		const observer = new ResizeObserver( draw );
		observer.observe( canvas );
		return () => {
			observer.disconnect();
			source.onload = null;
			drawRef.current = null;
			gl.deleteTexture( texture );
			gl.deleteBuffer( buffer );
			gl.deleteProgram( program );
			gl.deleteShader( vertex );
			gl.deleteShader( fragment );
		};
	}, [ image ] );

	useEffect( () => drawRef.current?.(), [ strength, scale, zoom ] );

	return <canvas ref={ canvasRef } className="dashboard-amplify-overview__hero-canvas" />;
}
