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
		const ctx = canvas.getContext( '2d' );

		canvas.width = width;
		canvas.height = height;

		const colors = [ '#2d4087', '#1c2b6e', '#425ca8' ];
		const preRandomizedColors = Array.from(
			{ length: height },
			() => colors[ Math.floor( Math.random() * 3 ) ]
		);

		let animationFactor = 1;

		function draw() {
			if ( ctx && canvas ) {
				ctx.globalCompositeOperation = 'source-over';
				ctx.fillStyle = '#1a286c';
				ctx.fillRect( 0, 0, canvas.width, canvas.height );

				ctx.globalCompositeOperation = 'multiply';

				for ( let j = 0; j < height; j += 3 ) {
					ctx.strokeStyle = preRandomizedColors[ j ];
					ctx.lineWidth = j % 15;
					ctx.beginPath();
					for ( let x = 0; x < width + 20; x += 10 ) {
						const y1 =
							j +
							Math.sin( ( x + animationFactor * width ) / 100 ) * 30 +
							( 1 + Math.sin( animationFactor ) ) * 5;
						const y2 = Math.sqrt( j * x * ( 1 + 2 * Math.sin( animationFactor ) ) ) - x / 2;
						const y = y1 + y2;
						ctx.lineTo( x, y );
					}
					ctx.stroke();
				}
				animationFactor += 0.001;
				animationRef.current = requestAnimationFrame( draw );
			}
		}

		animationRef.current = requestAnimationFrame( draw );

		return () => cancelAnimationFrame( animationRef.current );
	}, [ width, height ] );

	return <canvas className={ className } ref={ canvasRef } />;
}
