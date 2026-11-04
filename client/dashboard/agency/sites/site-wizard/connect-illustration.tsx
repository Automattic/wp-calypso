import { useEffect, useRef } from 'react';
import './connect-illustration.scss';

const SURGE_TRAVEL_MS = 1250;
const SURGE_SETTLE_MS = 440;
const SURGE_INITIAL_INTERVAL_MS = 1350;
const SURGE_MIN_INTERVAL_MS = 450;
const SURGE_BUILDUP_MS = 14000;
type CordImpulse = { center: number; strength: number; direction: number; travel: number };
type Point = { x: number; y: number };
type CordPoint = Point & { distance: number };
type Surge = { bornAt: number; strength: number; direction: number };
type SurgeShape = { center: number; radius: number; swelling: number };

function sampleCord(): CordPoint[] {
	const points = [
		{ x: 40, y: 46 },
		{ x: 40, y: 48 },
	];
	const curves = [
		[ 40, 48, 40, 60, 66, 53, 66, 31 ],
		[ 66, 31, 66, 16, 54, 5, 40, 5 ],
		[ 40, 5, 26, 5, 14, 17, 14, 32 ],
		[ 14, 32, 14, 39, 16, 45, 21, 49 ],
	];
	for ( const [ x0, y0, x1, y1, x2, y2, x3, y3 ] of curves ) {
		for ( let step = 1; step <= 48; step++ ) {
			const t = step / 48;
			const u = 1 - t;
			points.push( {
				x: u ** 3 * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t ** 3 * x3,
				y: u ** 3 * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t ** 3 * y3,
			} );
		}
	}
	let distance = 0;
	return points.map( ( point, index ) => {
		const previous = points[ Math.max( 0, index - 1 ) ];
		distance += Math.hypot( point.x - previous.x, point.y - previous.y );
		return { ...point, distance };
	} );
}

const CORD_POINTS = sampleCord();
const CORD_LENGTH = CORD_POINTS[ CORD_POINTS.length - 1 ].distance;

function interpolate( progress: number, stops: [ number, number ][] ) {
	const next = stops.findIndex( ( [ time ] ) => time >= progress );
	if ( next === -1 ) {
		return stops[ stops.length - 1 ][ 1 ];
	}
	if ( next <= 0 ) {
		return stops[ 0 ][ 1 ];
	}
	const [ startTime, start ] = stops[ next - 1 ];
	const [ endTime, end ] = stops[ next ];
	const t = ( progress - startTime ) / ( endTime - startTime );
	return start + ( end - start ) * t * t * ( 3 - 2 * t );
}

function cordOutline( points: Point[], surges: SurgeShape[] ) {
	const edges = points.map( ( point, index ) => {
		const before = points[ Math.max( 0, index - 1 ) ];
		const after = points[ Math.min( points.length - 1, index + 1 ) ];
		const dx = after.x - before.x;
		const dy = after.y - before.y;
		const length = Math.hypot( dx, dy ) || 1;
		const distance = CORD_POINTS[ index ].distance;
		const taper = Math.min( 1, ( CORD_LENGTH - distance ) / 16 );
		// Independent bulges share one continuous, tapered cord contour.
		const width = surges.reduce(
			( thickness, { center, radius, swelling } ) => {
				const pulse = ( distance - center ) / radius;
				return thickness + swelling * Math.pow( Math.max( 0, 1 - pulse * pulse ), 2 );
			},
			0.8 * taper * taper * ( 3 - 2 * taper )
		);
		return [
			{ x: point.x - ( dy / length ) * width, y: point.y + ( dx / length ) * width },
			{ x: point.x + ( dy / length ) * width, y: point.y - ( dx / length ) * width },
		];
	} );
	const outline = [
		...edges.map( ( edge ) => edge[ 0 ] ),
		...edges.map( ( edge ) => edge[ 1 ] ).reverse(),
	];
	return (
		outline
			.map(
				( point, index ) =>
					`${ index ? 'L' : 'M' }${ point.x.toFixed( 3 ) } ${ point.y.toFixed( 3 ) }`
			)
			.join( ' ' ) + 'Z'
	);
}

const CORD_FRAMES = CORD_POINTS.map( ( point, index ) => {
	const before = CORD_POINTS[ Math.max( 0, index - 1 ) ];
	const after = CORD_POINTS[ Math.min( CORD_POINTS.length - 1, index + 1 ) ];
	const length = Math.hypot( after.x - before.x, after.y - before.y ) || 1;
	return { tx: ( after.x - before.x ) / length, ty: ( after.y - before.y ) / length };
} );

function wireDisplacement( index: number, impulses: CordImpulse[] ): Point {
	const point = CORD_POINTS[ index ];
	const { tx, ty } = CORD_FRAMES[ index ];
	const bell = ( offset: number, width: number ) => Math.exp( -( ( offset / width ) ** 2 ) );
	let x = 0;
	let y = 0;
	for ( const impulse of impulses ) {
		const offset = point.distance - impulse.center;
		const strength = impulse.strength * Math.max( 0, 1 - Math.max( 0, impulse.travel - 1 ) / 0.35 );
		y += strength * ( 1.9 * bell( offset, 12 ) - 0.4 * bell( offset + 13, 7 ) );
		const normal =
			impulse.direction *
			( 0.5 * bell( offset, 9 ) - 0.95 * bell( offset - 12, 8 ) + 0.35 * bell( offset - 24, 10 ) );
		x += strength * -ty * normal;
		y += strength * tx * normal;
	}
	// Leave room for the bulge at the top of the loop, even with several surges in flight.
	return {
		x: Math.max( -2.8, Math.min( 2.8, x ) ),
		y: Math.max( -Math.min( 2.8, Math.max( 0, point.y - 3.8 ) ), Math.min( 2.8, y ) ),
	};
}

const REST_CORD = cordOutline( CORD_POINTS, [] );

export default function ConnectIllustration() {
	const svgRef = useRef< SVGSVGElement >( null );
	const cordRef = useRef< SVGPathElement >( null );
	const headRef = useRef< SVGGElement >( null );
	const sparksRef = useRef< SVGGElement >( null );

	useEffect( () => {
		const svg = svgRef.current;
		const cord = cordRef.current;
		const head = headRef.current;
		const sparks = sparksRef.current;
		if (
			! svg ||
			! cord ||
			! head ||
			! sparks ||
			typeof window.matchMedia !== 'function' ||
			typeof window.requestAnimationFrame !== 'function'
		) {
			return;
		}
		const target = svg.closest( '.agency-site-wizard__choice' ) ?? svg;
		const reducedMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' );
		let hovered = target.matches( ':hover' );
		let focused = target === document.activeElement;
		let frame = 0;
		let heldSince = 0;
		let nextSurgeAt = 0;
		let sequence = 0;
		let surges: Surge[] = [];
		const addSurge = ( now: number ) => {
			surges.push( {
				bornAt: now,
				strength: 0.94 + ( sequence % 3 ) * 0.06,
				direction: sequence % 2 ? -1 : 1,
			} );
			sequence++;
		};
		const reset = () => {
			cancelAnimationFrame( frame );
			frame = 0;
			surges = [];
			cord.setAttribute( 'd', REST_CORD );
			head.removeAttribute( 'transform' );
			sparks.style.opacity = '0';
		};
		const play = () => {
			if ( reducedMotion.matches || frame ) {
				return;
			}
			const tick = ( now: number ) => {
				if ( ( hovered || focused ) && now >= nextSurgeAt ) {
					addSurge( now );
					// Holding builds from one surge to several in flight, without restarting a timeline.
					const held = Math.min( 1, ( now - heldSince ) / SURGE_BUILDUP_MS );
					const charge = held * held * ( 3 - 2 * held );
					nextSurgeAt =
						now +
						SURGE_INITIAL_INTERVAL_MS -
						( SURGE_INITIAL_INTERVAL_MS - SURGE_MIN_INTERVAL_MS ) * charge;
				}
				surges = surges.filter(
					( surge ) => now - surge.bornAt < SURGE_TRAVEL_MS + SURGE_SETTLE_MS
				);
				if ( ! surges.length && ! hovered && ! focused ) {
					reset();
					return;
				}

				const shapes: SurgeShape[] = [];
				const impulses: CordImpulse[] = [];
				let lift = 0;
				let stretch = 1;
				let shift = 0;
				let tilt = 0;
				let sparkOpacity = 0;
				let sparkOffset = 0;
				for ( const surge of surges ) {
					const age = now - surge.bornAt;
					const travel = age / SURGE_TRAVEL_MS;
					const position = 1.06 - 1.12 * ( 0.7 * travel + 0.3 * travel * travel );
					impulses.push( {
						center: position * CORD_LENGTH,
						strength: surge.strength,
						direction: surge.direction,
						travel,
					} );
					if ( age < SURGE_TRAVEL_MS ) {
						const squash = interpolate( travel, [
							[ 0, 0 ],
							[ 0.26, 0.7 ],
							[ 0.48, 0 ],
							[ 0.73, 1 ],
							[ 1, 0 ],
						] );
						shapes.push( {
							center: position * CORD_LENGTH,
							radius: 5 - 1.2 * squash,
							swelling: ( 2 + 0.75 * squash ) * surge.strength,
						} );
					}

					const impact = age - SURGE_TRAVEL_MS;
					lift +=
						surge.strength *
						interpolate( impact, [
							[ -80, 0 ],
							[ 0, 0.6 ],
							[ 105, -1.2 ],
							[ 240, 0.3 ],
							[ 420, 0 ],
						] );
					stretch +=
						surge.strength *
						interpolate( impact, [
							[ -80, 0 ],
							[ 0, -0.05 ],
							[ 105, 0.03 ],
							[ 240, -0.01 ],
							[ 420, 0 ],
						] );
					shift +=
						surge.direction *
						surge.strength *
						interpolate( impact, [
							[ -80, 0 ],
							[ 0, -0.25 ],
							[ 105, 0.7 ],
							[ 240, -0.2 ],
							[ 420, 0 ],
						] );
					tilt +=
						surge.direction *
						surge.strength *
						interpolate( impact, [
							[ -80, 0 ],
							[ 0, -0.8 ],
							[ 105, 2.5 ],
							[ 240, -0.7 ],
							[ 420, 0 ],
						] );

					// Each arrival fires its own short burst after the pressure reaches the pins.
					const sparkAge = impact - 90;
					const opacity = interpolate( sparkAge, [
						[ 0, 0 ],
						[ 20, 1 ],
						[ 70, 0.9 ],
						[ 220, 0 ],
					] );
					if ( opacity > sparkOpacity ) {
						sparkOpacity = opacity;
						const burst = Math.min( 1, Math.max( 0, sparkAge / 220 ) );
						sparkOffset = -0.86 * ( 1 - Math.pow( 1 - burst, 3 ) );
					}
				}

				head.setAttribute(
					'transform',
					`translate(${ 40 + shift } ${ 46 + lift }) rotate(${ tilt }) scale(${ 1 / stretch } ${ stretch }) translate(-40 -46)`
				);
				const angle = ( tilt * Math.PI ) / 180;
				const cos = Math.cos( angle );
				const sin = Math.sin( angle );
				const points = CORD_POINTS.map( ( point, index ) => {
					const release = Math.min( 1, point.distance / 12 );
					const freedom = release * release * ( 3 - 2 * release );
					const displacement = wireDisplacement( index, impulses );
					// The short neck follows the plug; the rest of the cord keeps its resting curve.
					const attachment = Math.exp( -( ( point.distance / 12 ) ** 2 ) );
					const localX = ( point.x - 40 ) / stretch;
					const localY = ( point.y - 46 ) * stretch;
					const followX = ( 40 + shift + localX * cos - localY * sin - point.x ) * attachment;
					const followY = ( 46 + lift + localX * sin + localY * cos - point.y ) * attachment;
					return {
						x: point.x + displacement.x * freedom + followX,
						y: point.y + displacement.y * freedom + followY,
					};
				} );
				cord.setAttribute( 'd', cordOutline( points, shapes ) );
				sparks.style.strokeDashoffset = String( sparkOffset );
				sparks.style.opacity = String( sparkOpacity );
				frame = requestAnimationFrame( tick );
			};
			frame = requestAnimationFrame( tick );
		};
		const startStream = () => {
			heldSince = performance.now();
			const previousSurge = surges[ surges.length - 1 ];
			nextSurgeAt = previousSurge
				? Math.max( heldSince, previousSurge.bornAt + SURGE_MIN_INTERVAL_MS )
				: heldSince;
			play();
		};
		const onPointerEnter = () => {
			const wasActive = hovered || focused;
			hovered = true;
			if ( ! wasActive ) {
				startStream();
			}
		};
		const onPointerLeave = () => {
			hovered = false;
		};
		const onFocus = () => {
			const wasActive = hovered || focused;
			focused = true;
			if ( ! wasActive ) {
				startStream();
			}
		};
		const onBlur = () => {
			focused = false;
		};
		const onMotionPreferenceChange = () => {
			if ( reducedMotion.matches ) {
				reset();
			} else if ( hovered || focused ) {
				startStream();
			}
		};
		target.addEventListener( 'pointerenter', onPointerEnter );
		target.addEventListener( 'pointerleave', onPointerLeave );
		target.addEventListener( 'focus', onFocus );
		target.addEventListener( 'blur', onBlur );
		reducedMotion.addEventListener( 'change', onMotionPreferenceChange );
		if ( hovered || focused ) {
			startStream();
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

	return (
		<svg
			ref={ svgRef }
			className="agency-site-wizard__illustration agency-site-wizard__connect-illustration"
			viewBox="0 0 80 64"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			focusable="false"
		>
			<path ref={ cordRef } d={ REST_CORD } fill="currentColor" stroke="none" />
			<g ref={ headRef }>
				{ /* Flat pin bases stop at the housing edge; only their tips are rounded. */ }
				<path
					d="M33.8 25v-7a1.2 1.2 0 0 1 2.4 0v7ZM43.8 25v-7a1.2 1.2 0 0 1 2.4 0v7Z"
					fill="currentColor"
					stroke="none"
				/>
				<path d="M31 25h18v8c0 4-2.4 7-6 8v5h-6v-5c-3.6-1-6-4-6-8Z" />
				<path d="M36 30h8M36 33h8M37 42h6" strokeWidth="0.8" />
				<g ref={ sparksRef } className="agency-connect-illustration__sparks" strokeWidth="1.3">
					<path d="M35 17l-8-1.5" pathLength="1" />
					<path d="M35 17l-6-6" pathLength="1" />
					<path d="M35 17l-1-8.5" pathLength="1" />
					<path d="M45 17l8-1.5" pathLength="1" />
					<path d="M45 17l6-6" pathLength="1" />
					<path d="M45 17l1-8.5" pathLength="1" />
				</g>
			</g>
		</svg>
	);
}
