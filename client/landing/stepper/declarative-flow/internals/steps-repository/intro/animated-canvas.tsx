import { useRef, useEffect } from 'react';
import useWindowDimensions from 'calypso/blocks/import/windowDimensions.effect';

export function AnimatedCanvas( { className }: { className: string } ) {
	const { width, height } = useWindowDimensions();
	const canvasRef = useRef< HTMLCanvasElement >( null );
	const animationRef = useRef< number >( 0 );

	useEffect( () => {
		const canvas = canvasRef.current;

		if ( ! canvas ) {
			return;
		}
		const ctx = canvas.getContext( '2d' ) as CanvasRenderingContext2D;

		canvas.width = width;
		canvas.height = height;

		const colors = [ '#2d408755', '#1c536e54', '#425ca855' ];

		let animationFactor = 1;

		ctx.globalCompositeOperation = 'source-over';
		ctx.fillStyle = '#141b3d';
		ctx.fillRect( 0, 0, width, height );

		function draw() {
			if ( ctx && canvas ) {
				ctx.globalCompositeOperation = 'source-over';
				ctx.fillStyle = '#1a286c05';
				ctx.fillRect( 0, 0, width, height );

				ctx.globalCompositeOperation = 'multiply';
				let index = 0;
				for ( let j = 0; j < height; j += height / 30 ) {
					ctx.strokeStyle = colors[ index % 3 ];
					ctx.lineWidth = ( 1 + Math.sin( index ) ) * 5;
					ctx.beginPath();
					for ( let x = 0; x < width + 150; x += width / 100 ) {
						const afterHalf = 1000 * ( Math.abs( x - 100 - width / 2 ) / width );
						const y1 =
							j +
							Math.sin( ( x + animationFactor * width ) / 100 ) * ( height / 15 ) +
							( 1 + Math.sin( animationFactor ) ) * 5;
						const y2 = Math.sqrt( j * x * ( 1 + 2 * Math.sin( animationFactor ) ) ) - x / 2;
						const y = y1 + y2;
						ctx.lineTo( x - 100, y - afterHalf );
					}
					ctx.stroke();
				}

				animationFactor += 0.001;
				animationRef.current = window.setTimeout( draw, 70, false );
				index = ( index + 0.2 ) % 3;
			}
		}

		draw();

		return () => clearTimeout( animationRef.current );
	}, [ width, height ] );

	return <canvas className={ className } ref={ canvasRef } />;
}
