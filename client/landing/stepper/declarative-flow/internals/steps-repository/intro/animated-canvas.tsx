import { useRef, useEffect } from 'react';
import {
	createProgramInfo,
	createBufferInfoFromArrays,
	setBuffersAndAttributes,
	setUniforms,
	drawBufferInfo,
} from 'twgl.js';
import useWindowDimensions from 'calypso/blocks/import/windowDimensions.effect';
import fragmentShaderSource from './fragment-shader';
import vertexShaderSource from './vertex-shader';

const DESKTOP_TOP = 0.6;
const DESKTOP_BOTTOM = 0.8;

const MOBILE_TOP = -0.3;
const MOBILE_BOTTOM = 0.8;

export function AnimatedCanvas( { className }: { className: string } ) {
	const { width, height } = useWindowDimensions();
	const canvasRef = useRef< HTMLCanvasElement >( null );
	const animationRef = useRef< number >( 0 );

	useEffect( () => {
		const canvas = canvasRef.current;

		if ( ! canvas ) {
			return;
		}

		canvas.width = width;
		canvas.height = height;

		const gl = canvas.getContext( 'webgl' ) as WebGLRenderingContext;

		const programInfo = createProgramInfo( gl, [ vertexShaderSource, fragmentShaderSource ] );

		const top = width > 600 ? DESKTOP_TOP : MOBILE_TOP;
		const bottom = width > 600 ? DESKTOP_BOTTOM : MOBILE_BOTTOM;

		const arrays = {
			position: [
				// right-side triangle
				0,
				-bottom,
				0,
				1,
				top,
				0,
				1,
				-1,
				0,
				// left-side triangle
				0,
				-bottom,
				0,
				-1,
				top,
				0,
				-1,
				-1,
				0,
				// bottom filler triangle
				-1,
				-1,
				0,
				0,
				-bottom,
				0,
				1,
				-1,
				0,
			],
		};
		const bufferInfo = createBufferInfoFromArrays( gl, arrays );

		gl.useProgram( programInfo.program );

		function render( time: number ) {
			gl.viewport( 0, 0, width, height );

			const uniforms = {
				time: time * 0.001,
				resolution: [ width, height ],
			};
			setUniforms( programInfo, uniforms );

			setBuffersAndAttributes( gl, programInfo, bufferInfo );
			drawBufferInfo( gl, bufferInfo );

			animationRef.current = window.requestAnimationFrame( render );
		}

		render( 0 );

		return () => cancelAnimationFrame( animationRef.current );
	}, [ width, height ] );

	return <canvas className={ className } ref={ canvasRef } />;
}
