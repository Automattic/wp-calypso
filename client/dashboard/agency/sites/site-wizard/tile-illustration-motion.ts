import { useEffect } from 'react';
import type { Tile } from './construction-illustration';
import type { RefObject } from 'react';

type Pose = { x?: number; y?: number; r?: number; sx?: number; sy?: number };
const IDENTITY = 'translate(0px, 0px) rotate(0deg) scale(1, 1)';
const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';
const ACCELERATE = 'cubic-bezier(0.55, 0, 1, 0.5)';
const DECELERATE = 'cubic-bezier(0, 0.6, 0.3, 1)';
const GLIDE = 'cubic-bezier(0.2, 0.7, 0.3, 1)';

export function transform( { x = 0, y = 0, r = 0, sx = 1, sy = 1 }: Pose ) {
	return `translate(${ x }px, ${ y }px) rotate(${ r }deg) scale(${ sx }, ${ sy })`;
}

export function restPose( tile: Tile ): Pose {
	if ( tile.kind === 'chrome' ) {
		return { x: -2, y: -7, r: -3 };
	}
	if ( tile.id === 'c' ) {
		return { x: 2, y: 6, r: 3 };
	}
	const side = tile.x + tile.w / 2 < 40 ? -1 : 1;
	return { x: side * 6, r: side * 5 };
}

function frame( offset: number, pose: Pose = {}, easing = EASE ): Keyframe {
	return { offset, transform: transform( pose ), easing };
}

function entry( tile: Tile ) {
	const rest = restPose( tile );
	const beats: Record< string, [ number, number ] > = {
		header: [ 0, 260 ],
		c: [ 90, 300 ],
		a: [ 150, 360 ],
		b: [ 570, 210 ],
	};
	const [ delay, duration ] = beats[ tile.id ];
	return {
		delay,
		duration,
		frames: [ frame( 0, rest, DECELERATE ), frame( 0.23, { ...rest, r: 0 }, GLIDE ), frame( 1 ) ],
	};
}

type ShuffleBeat = { action: 'move' | 'fill'; tile: string; duration: number };
const SHUFFLE_BEATS: ShuffleBeat[] = [
	{ action: 'move', tile: 'b', duration: 460 },
	{ action: 'move', tile: 'a', duration: 510 },
	{ action: 'move', tile: 'c', duration: 460 },
	{ action: 'move', tile: 'b', duration: 510 },
	{ action: 'fill', tile: 'a', duration: 1710 },
	{ action: 'move', tile: 'a', duration: 460 },
	{ action: 'move', tile: 'c', duration: 510 },
	{ action: 'move', tile: 'b', duration: 460 },
	{ action: 'fill', tile: 'a', duration: 1560 },
	{ action: 'move', tile: 'a', duration: 510 },
	{ action: 'move', tile: 'c', duration: 460 },
	{ action: 'move', tile: 'b', duration: 510 },
	{ action: 'fill', tile: 'b', duration: 1510 },
	{ action: 'move', tile: 'a', duration: 460 },
	{ action: 'move', tile: 'c', duration: 510 },
];
const SHUFFLE_DURATION = SHUFFLE_BEATS.reduce( ( total, beat ) => total + beat.duration, 1520 );

type TileBounds = { x: number; y: number; w: number; h: number };
export function restBounds( tile: Tile ): TileBounds {
	return { x: tile.x, y: tile.y, w: tile.id === 'c' ? 42 : tile.w, h: tile.h };
}

export function contentTransform( tile: Tile, bounds: TileBounds ) {
	return transform( {
		x: bounds.x - tile.x + ( bounds.w - tile.w ) / 2,
		y: bounds.y - tile.y + ( bounds.h - tile.h ) / 2,
	} );
}

function boundsFrame( { x, y, w, h }: TileBounds ): Keyframe {
	return { x: `${ x }px`, y: `${ y }px`, width: `${ w }px`, height: `${ h }px` };
}

function shuffleFrames(
	tile: Tile,
	track: 'motion' | 'outline' | 'content' = 'motion'
): Keyframe[] {
	const cells = [
		[ 0, 0 ],
		[ 22, 0 ],
		[ 0, 14 ],
		[ 22, 14 ],
	];
	const initial: Record< string, number > = { a: 0, b: 1, c: 2 };
	const current = { ...initial };
	let empty = 3;
	let time = 620;
	let pose: Pose = {};
	const frames: Keyframe[] = [];
	const append = ( at: number, motion = pose, bounds: TileBounds = tile, easing = EASE ) => {
		const values =
			track === 'outline'
				? boundsFrame( bounds )
				: {
						transform: track === 'content' ? contentTransform( tile, bounds ) : transform( motion ),
					};
		frames.push( { ...values, offset: at / SHUFFLE_DURATION, easing } );
	};
	append( 0, pose, restBounds( tile ) );
	append( 160, pose, restBounds( tile ) );
	append( 520 );
	SHUFFLE_BEATS.forEach( ( beat, step ) => {
		append( time );
		if ( beat.action === 'move' ) {
			if ( tile.id === beat.tile ) {
				const target = {
					x: cells[ empty ][ 0 ] - cells[ initial[ tile.id ] ][ 0 ],
					y: cells[ empty ][ 1 ] - cells[ initial[ tile.id ] ][ 1 ],
				};
				append( time + 170, {
					x: ( ( pose.x ?? 0 ) + target.x ) / 2,
					y: ( ( pose.y ?? 0 ) + target.y ) / 2,
					r: step % 2 ? -1.5 : 1.5,
					sx: 0.98,
					sy: 1.02,
				} );
				pose = target;
			}
			append( time + 350 );
			[ current[ beat.tile ], empty ] = [ empty, current[ beat.tile ] ];
		} else if ( tile.id === beat.tile ) {
			// Grow only into the vacant cell, then clear it before the next slide.
			const dx = cells[ empty ][ 0 ] - cells[ current[ tile.id ] ][ 0 ];
			const dy = cells[ empty ][ 1 ] - cells[ current[ tile.id ] ][ 1 ];
			const stretch = ( amount: number ): TileBounds => ( {
				x: tile.x + Math.min( dx, 0 ) * amount,
				y: tile.y + Math.min( dy, 0 ) * amount,
				w: tile.w + Math.abs( dx ) * amount,
				h: tile.h + Math.abs( dy ) * amount,
			} );
			append( time + 90, pose, stretch( -0.025 ), ACCELERATE );
			append( time + 390, pose, stretch( 1.025 ), DECELERATE );
			append( time + 520, pose, stretch( 1 ) );
			append( time + beat.duration - 380, pose, stretch( 1 ), EASE );
			append( time + beat.duration - 80 );
		}
		time += beat.duration;
		append( time );
	} );
	append( time + 120, pose, tile, ACCELERATE );
	append(
		time + 430,
		pose,
		{ ...restBounds( tile ), w: tile.id === 'c' ? 42.55 : tile.w },
		DECELERATE
	);
	append( time + 560, pose, restBounds( tile ) );
	append( SHUFFLE_DURATION, pose, restBounds( tile ) );
	return frames;
}

export function useTileMotion( ref: RefObject< SVGSVGElement | null >, tiles: Tile[] ) {
	useEffect( () => {
		const svg = ref.current;
		if ( ! svg || typeof svg.animate !== 'function' ) {
			return;
		}
		const target = svg.closest( '.agency-site-wizard__choice' ) ?? svg;
		const media = window.matchMedia( '(prefers-reduced-motion: reduce)' );
		const arrivals = Array.from(
			svg.querySelectorAll< SVGGElement >( '.agency-construction__tile' )
		);
		const players = Array.from(
			svg.querySelectorAll< SVGGElement >( '.agency-construction__tile-play' )
		);
		const outlines = Array.from(
			svg.querySelectorAll< SVGRectElement >( '.agency-construction__tile-outline' )
		);
		const contents = Array.from(
			svg.querySelectorAll< SVGGElement >( '.agency-construction__tile-content' )
		);
		let animations: Animation[] = [];
		let hovered = target.matches( ':hover' );
		let focused = target.matches( ':focus-visible' );
		let active = false;
		let resting = true;
		let revision = 0;
		const run = ( force = false ) => {
			const next = hovered || focused;
			if ( next === active && ! force ) {
				return;
			}
			active = next;
			const currentRevision = ++revision;
			// Capture before cancelling so a quick exit/re-entry never jumps to an endpoint.
			const current = [ ...arrivals, ...players ].map(
				( node ) => getComputedStyle( node ).transform
			);
			const currentBounds = outlines.map( ( node ) => {
				const style = getComputedStyle( node );
				return {
					x: style.getPropertyValue( 'x' ),
					y: style.getPropertyValue( 'y' ),
					width: style.width,
					height: style.height,
				};
			} );
			const currentContents = contents.map( ( node ) => getComputedStyle( node ).transform );
			animations.forEach( ( animation ) => animation.cancel() );
			animations = [];
			if ( media.matches ) {
				return;
			}
			const entries = tiles.map( entry );
			const playDelay = resting
				? Math.max( ...entries.map( ( item ) => item.duration + item.delay ) ) + 120
				: 650 + 120;
			arrivals.forEach( ( node, index ) => {
				const item = entries[ index ];
				const enterFrames = resting
					? [ { ...item.frames[ 0 ], transform: current[ index ] }, ...item.frames.slice( 1 ) ]
					: [ { transform: current[ index ], easing: EASE }, { transform: IDENTITY } ];
				animations.push(
					node.animate(
						active
							? enterFrames
							: [
									{ transform: current[ index ], easing: EASE },
									{ transform: transform( restPose( tiles[ index ] ) ) },
								],
						{
							duration: active && resting ? item.duration : 650,
							delay: active && resting ? item.delay : 0,
							fill: 'both',
						}
					)
				);
				const player = players[ index ];
				if ( active ) {
					// Finish any secondary motion before starting the next held-hover episode.
					animations.push(
						player.animate(
							[
								{ transform: current[ index + arrivals.length ], easing: EASE },
								{ transform: IDENTITY },
							],
							{ duration: 500 }
						)
					);
					animations.push(
						player.animate( shuffleFrames( tiles[ index ] ), {
							duration: SHUFFLE_DURATION,
							delay: playDelay,
							iterations: Infinity,
						} )
					);
				} else {
					animations.push(
						player.animate(
							[
								{ transform: current[ index + arrivals.length ], easing: EASE },
								{ transform: IDENTITY },
							],
							{ duration: 650, fill: 'both' }
						)
					);
				}
			} );
			outlines.forEach( ( outline, index ) => {
				const content = contents[ index ];
				const tile = tiles[ index ];
				animations.push(
					outline.animate(
						[ { ...currentBounds[ index ], easing: EASE }, boundsFrame( restBounds( tile ) ) ],
						{
							duration: active ? 500 : 650,
							fill: 'both',
						}
					),
					content.animate(
						[
							{ transform: currentContents[ index ], easing: EASE },
							{ transform: contentTransform( tile, restBounds( tile ) ) },
						],
						{ duration: active ? 500 : 650, fill: 'both' }
					)
				);
				if ( active ) {
					const timing = { duration: SHUFFLE_DURATION, delay: playDelay, iterations: Infinity };
					animations.push(
						outline.animate( shuffleFrames( tile, 'outline' ), timing ),
						content.animate( shuffleFrames( tile, 'content' ), timing )
					);
				}
			} );
			resting = false;
			if ( ! active ) {
				animations[ 0 ].onfinish = () => {
					if ( currentRevision === revision ) {
						resting = true;
					}
				};
			}
		};
		const enter = () => {
			hovered = true;
			run();
		};
		const leave = () => {
			hovered = false;
			run();
		};
		const focus = () => {
			focused = true;
			run();
		};
		const blur = () => {
			focused = false;
			run();
		};
		const preference = () => run( true );
		target.addEventListener( 'pointerenter', enter );
		target.addEventListener( 'pointerleave', leave );
		target.addEventListener( 'focus', focus );
		target.addEventListener( 'blur', blur );
		media.addEventListener( 'change', preference );
		run();
		return () => {
			animations.forEach( ( animation ) => animation.cancel() );
			target.removeEventListener( 'pointerenter', enter );
			target.removeEventListener( 'pointerleave', leave );
			target.removeEventListener( 'focus', focus );
			target.removeEventListener( 'blur', blur );
			media.removeEventListener( 'change', preference );
		};
	}, [ ref, tiles ] );
}
