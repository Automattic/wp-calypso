import { useEffect, useId, useRef } from 'react';

const DURATION = 2400;
const SERVER_ROWS = [ 19, 23.5, 28, 32.5, 37 ];
const SERVER_WIDTH = 28.5;
const SERVER_HEIGHT = 4.5;
const SPEED_LINES = [
	{ y: 25, length: 5 },
	{ y: 33, length: 7 },
	{ y: 41, length: 5.5 },
];

function TruckServer( { y }: { y: number } ) {
	const x = 34 - SERVER_WIDTH / 2;
	const cy = y + SERVER_HEIGHT / 2;
	return (
		<>
			<rect x={ x } y={ y } width={ SERVER_WIDTH } height={ SERVER_HEIGHT } rx="0.6" />
			<circle cx={ x + 3 } cy={ cy } r="0.45" fill="currentColor" stroke="none" />
			<circle cx={ x + 5 } cy={ cy } r="0.3" fill="currentColor" stroke="none" />
			<path
				d={ `M${ x + SERVER_WIDTH - 6.5 } ${ cy - 0.6 }v1.2m1.5-1.2v1.2m1.5-1.2v1.2` }
				strokeWidth="0.45"
			/>
		</>
	);
}

function TruckWheel() {
	return (
		<>
			<circle r="4.8" strokeWidth="1.6" />
			{ /* Use the A4A mark's original slash contour, scaled into the wheel hub. */ }
			<path
				transform="scale(0.175) translate(-32 -32.33665)"
				d="M38.8263 22.3617C40.5964 23.5221 41.0927 25.934 39.9441 27.7441L30.9904 41.8447C29.8402 43.6563 27.4737 44.1803 25.7065 43.02C23.9394 41.8566 23.4372 39.4507 24.5888 37.6391L33.5425 23.5385C34.6926 21.7284 37.0591 21.2029 38.8263 22.3617Z"
				fill="currentColor"
				stroke="none"
			/>
		</>
	);
}

function interpolate( progress: number, stops: [ number, number ][] ) {
	const next = stops.findIndex( ( [ time ] ) => time >= progress );
	if ( next === -1 ) {
		return stops[ stops.length - 1 ][ 1 ];
	}
	if ( next === 0 ) {
		return stops[ 0 ][ 1 ];
	}
	const [ startTime, start ] = stops[ next - 1 ];
	const [ endTime, end ] = stops[ next ];
	const t = ( progress - startTime ) / ( endTime - startTime );
	return start + ( end - start ) * t * t * ( 3 - 2 * t );
}

function wheelLift( progress: number ) {
	return interpolate( progress, [
		[ 0, 0 ],
		[ 0.11, 0 ],
		[ 0.17, -1.4 ],
		[ 0.23, 0.35 ],
		[ 0.3, 0 ],
		[ 0.51, 0 ],
		[ 0.57, -1 ],
		[ 0.63, 0.25 ],
		[ 0.7, 0 ],
		[ 1, 0 ],
	] );
}

function cargoBounce( progress: number ) {
	return interpolate( progress, [
		[ 0, 0 ],
		[ 0.16, 0 ],
		[ 0.21, -0.1 ],
		[ 0.35, 1 ],
		[ 0.43, -0.12 ],
		[ 0.49, 0.22 ],
		[ 0.55, 0 ],
		[ 0.6, 0 ],
		[ 0.64, -0.06 ],
		[ 0.74, 0.75 ],
		[ 0.82, -0.08 ],
		[ 0.87, 0.14 ],
		[ 0.93, 0 ],
		[ 1, 0 ],
	] );
}

function cargoSway( progress: number ) {
	return interpolate( progress, [
		[ 0, 0 ],
		[ 0.18, -0.2 ],
		[ 0.34, -1.4 ],
		[ 0.44, 0.8 ],
		[ 0.54, 0 ],
		[ 0.62, 0.4 ],
		[ 0.74, 1.2 ],
		[ 0.84, -0.6 ],
		[ 0.94, 0 ],
		[ 1, 0 ],
	] );
}

export default function TruckIllustration() {
	const wheelMask = useId();
	const bedMask = useId();
	const svgRef = useRef< SVGSVGElement >( null );
	const truckRef = useRef< SVGGElement >( null );
	const bodyRef = useRef< SVGGElement >( null );
	const loadRef = useRef< SVGGElement >( null );
	const rearRef = useRef< SVGGElement >( null );
	const frontRef = useRef< SVGGElement >( null );
	const rearClearanceRef = useRef< SVGCircleElement >( null );
	const frontClearanceRef = useRef< SVGCircleElement >( null );
	const speedLinesRef = useRef< SVGGElement >( null );

	useEffect( () => {
		const svg = svgRef.current;
		const truck = truckRef.current;
		const body = bodyRef.current;
		const load = loadRef.current;
		const rear = rearRef.current;
		const front = frontRef.current;
		const rearClearance = rearClearanceRef.current;
		const frontClearance = frontClearanceRef.current;
		const speedLines = speedLinesRef.current;
		if (
			! svg ||
			! truck ||
			! body ||
			! load ||
			! rear ||
			! front ||
			! rearClearance ||
			! frontClearance ||
			! speedLines ||
			typeof window.matchMedia !== 'function' ||
			typeof window.requestAnimationFrame !== 'function'
		) {
			return;
		}
		const target = svg.closest( '.agency-site-wizard__choice' ) ?? svg;
		const reducedMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' );
		const trails = speedLines.querySelectorAll( 'path' );
		const panels = Array.from( load.children );
		let hovered = target.matches( ':hover' );
		let focused = target === document.activeElement;
		let frame = 0;
		const reset = () => {
			cancelAnimationFrame( frame );
			frame = 0;
			truck.removeAttribute( 'transform' );
			body.removeAttribute( 'transform' );
			panels.forEach( ( panel ) => panel.removeAttribute( 'transform' ) );
			rear.setAttribute( 'transform', 'translate(28 48)' );
			front.setAttribute( 'transform', 'translate(66 48)' );
			rearClearance.setAttribute( 'cy', '48' );
			frontClearance.setAttribute( 'cy', '48' );
			trails.forEach( ( line, index ) => {
				const { y, length } = SPEED_LINES[ index ];
				line.setAttribute( 'd', `M${ 13 - length } ${ y }h${ length }` );
				line.setAttribute( 'opacity', '0.4' );
			} );
		};
		const play = () => {
			if ( reducedMotion.matches || frame ) {
				return;
			}
			let start: number | undefined;
			const tick = ( now: number ) => {
				start ??= now;
				if ( now - start >= DURATION ) {
					if ( hovered || focused ) {
						start = now - ( ( now - start ) % DURATION );
					} else {
						// Finish the bounce before resting; wheel rotations end on full turns.
						reset();
						return;
					}
				}
				const progress = ( now - start ) / DURATION;
				const trailMotion = interpolate( progress, [
					[ 0, 0 ],
					[ 0.04, 1 ],
					[ 0.96, 1 ],
					[ 1, 0 ],
				] );
				trails.forEach( ( line, index ) => {
					const { y, length } = SPEED_LINES[ index ];
					const phase = ( progress * 3 + index / 3 ) % 1;
					const envelope = Math.sin( Math.PI * phase );
					// Each trail stretches away from the truck, then fades before restarting.
					const head = 13 + ( 2 - 6 * phase ) * trailMotion;
					const span = length * ( 1 - ( 1 - envelope ) * 0.6 * trailMotion );
					line.setAttribute( 'd', `M${ head - span } ${ y }h${ span }` );
					line.setAttribute(
						'opacity',
						String( 0.4 + ( 0.55 * envelope * envelope - 0.4 ) * trailMotion )
					);
				} );
				const x = interpolate( progress, [
					[ 0, 0 ],
					[ 0.1, -1.7 ],
					[ 0.32, 2.7 ],
					[ 0.6, -2.7 ],
					[ 0.82, 1.8 ],
					[ 1, 0 ],
				] );
				// The front axle hits each bump first; the rear follows over the same road.
				const frontY = wheelLift( progress );
				const rearY = wheelLift( progress - 0.1 );
				const spring = interpolate( progress, [
					[ 0, 0 ],
					[ 0.1, 0.7 ],
					[ 0.22, -1.2 ],
					[ 0.31, -2.6 ],
					[ 0.4, 0.9 ],
					[ 0.47, -0.4 ],
					[ 0.52, 0 ],
					[ 0.62, -0.9 ],
					[ 0.7, -1.8 ],
					[ 0.78, 0.65 ],
					[ 0.85, -0.25 ],
					[ 0.94, 0 ],
					[ 1, 0 ],
				] );
				const pitch =
					( frontY - rearY ) * 1.5 +
					interpolate( progress, [
						[ 0, 0 ],
						[ 0.1, -1.1 ],
						[ 0.32, 0.8 ],
						[ 0.46, 0 ],
						[ 0.6, -0.6 ],
						[ 0.82, 0.4 ],
						[ 1, 0 ],
					] );
				// Keep rolling forward even while the truck falls back relative to the viewer.
				const rotation = progress * 1440 + ( x / 5 ) * ( 180 / Math.PI );
				truck.setAttribute( 'transform', `translate(${ x } 0)` );
				body.setAttribute(
					'transform',
					`translate(0 ${ ( frontY + rearY ) / 2 + spring }) rotate(${ pitch } 47 48)`
				);
				// Each layer follows the one below; the bed holds the lowest panel more firmly.
				let cargoLift = 0;
				for ( let index = panels.length - 1; index >= 0; index-- ) {
					const layer = panels.length - 1 - index;
					const level = ( layer * 2 ) / ( panels.length - 1 );
					const delayedProgress = progress - level * 0.018;
					const sway = cargoSway( delayedProgress );
					const shift = sway * ( 0.2 + 0.05 * level + 0.2 * level ** 2 );
					const tilt = -sway * ( 0.5 + level * 0.7 );
					const bounce = cargoBounce( delayedProgress );
					const clearance = layer > 0 ? Math.abs( sway ) * 0.15 : 0;
					cargoLift -=
						Math.max( 0, bounce ) * ( layer === 0 ? 1.3 : 2 / ( panels.length - 1 ) ) + clearance;
					panels[ index ].setAttribute(
						'transform',
						`translate(${ shift } ${ cargoLift }) rotate(${ tilt } 34 ${ SERVER_ROWS[ index ] + SERVER_HEIGHT / 2 })`
					);
				}
				for ( const [ wheel, clearance, axle, lift ] of [
					[ rear, rearClearance, 28, rearY ],
					[ front, frontClearance, 66, frontY ],
				] as const ) {
					// A slight tire compression adds weight to the landing.
					const compression = 1 - Math.max( 0, lift ) * 0.09;
					wheel.setAttribute(
						'transform',
						`translate(${ axle } ${ 48 + lift }) scale(${ 1 / compression } ${ compression }) rotate(${ rotation })`
					);
					clearance.setAttribute( 'cy', String( 48 + lift ) );
				}
				frame = requestAnimationFrame( tick );
			};
			frame = requestAnimationFrame( tick );
		};
		const onPointerEnter = () => {
			hovered = true;
			play();
		};
		const onPointerLeave = () => {
			hovered = false;
		};
		const onFocus = () => {
			focused = true;
			play();
		};
		const onBlur = () => {
			focused = false;
		};
		const onMotionPreferenceChange = () => {
			if ( reducedMotion.matches ) {
				reset();
			}
		};
		target.addEventListener( 'pointerenter', onPointerEnter );
		target.addEventListener( 'pointerleave', onPointerLeave );
		target.addEventListener( 'focus', onFocus );
		target.addEventListener( 'blur', onBlur );
		reducedMotion.addEventListener( 'change', onMotionPreferenceChange );
		if ( hovered || focused ) {
			play();
		}
		return () => {
			reset();
			target.removeEventListener( 'pointerenter', onPointerEnter );
			target.removeEventListener( 'pointerleave', onPointerLeave );
			target.removeEventListener( 'focus', onFocus );
			target.removeEventListener( 'blur', onBlur );
			reducedMotion.removeEventListener( 'change', onMotionPreferenceChange );
		};
	}, [] );

	// Center the vehicle's x=18–74 bounds; the speed lines sit outside that balance.
	return (
		<svg
			ref={ svgRef }
			className="agency-site-wizard__illustration"
			viewBox="6 0 80 64"
			overflow="visible"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			focusable="false"
		>
			<defs>
				<mask id={ bedMask } maskUnits="userSpaceOnUse" x="0" y="0" width="80" height="64">
					{ /* The pickup's side hides the base of the bottom server. */ }
					<rect width="80" height="39.4" fill="white" stroke="none" />
				</mask>
				<mask id={ wheelMask } maskUnits="userSpaceOnUse" x="0" y="0" width="80" height="64">
					<rect width="80" height="64" fill="white" stroke="none" />
					{ /* Wheel clearances follow the axles while the body moves on its suspension. */ }
					<circle ref={ rearClearanceRef } cx="28" cy="48" r="5.9" fill="black" stroke="none" />
					<circle ref={ frontClearanceRef } cx="66" cy="48" r="5.9" fill="black" stroke="none" />
				</mask>
			</defs>
			<g ref={ truckRef }>
				<g ref={ speedLinesRef } strokeWidth="0.8">
					{ SPEED_LINES.map( ( { y, length } ) => (
						<path key={ y } d={ `M${ 13 - length } ${ y }h${ length }` } opacity="0.4" />
					) ) }
				</g>
				<g mask={ `url(#${ wheelMask })` }>
					<g ref={ bodyRef }>
						<g ref={ loadRef } mask={ `url(#${ bedMask })` }>
							{ SERVER_ROWS.map( ( y ) => (
								<g key={ y }>
									<TruckServer y={ y } />
								</g>
							) ) }
						</g>
						<path d="M18 40h32v-8a2 2 0 0 1 2-2h6l5 8h9a2 2 0 0 1 2 2v8H18Z" />
						<path d="M53 32.5h3.5l3.5 5H53ZM50 40v6M53 41h2M71 41h3" strokeWidth="0.8" />
					</g>
				</g>
				<g ref={ rearRef } transform="translate(28 48)">
					<TruckWheel />
				</g>
				<g ref={ frontRef } transform="translate(66 48)">
					<TruckWheel />
				</g>
			</g>
		</svg>
	);
}
