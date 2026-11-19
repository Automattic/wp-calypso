import { useEffect, useRef } from 'react';

// The same capture signup asks mShots for when the address is entered, so it's usually ready by now.
const MSHOT_PARAMS = 'vpw=1440&vph=1440&w=1440&h=1462&screen_height=1440&scale=2';
// mShots answers with a 400×300 placeholder while it's still taking the shot.
const MSHOT_PLACEHOLDER = { width: 400, height: 300 };
const MSHOT_TRIES = 10;

const COLUMNS = 5;
const ROWS = 4;
/** How long a piece takes to unroll into place, or to roll back up. */
const UNROLL_DURATION = 1800;
/** The radius of a piece still fully rolled up. */
const ROLL_RADIUS = 13;
/** How fast the decorator walks along a finished row, in pixels a millisecond: slowly. */
const WALK_SPEED = 0.045;
/** How far in front of the decorator the roller is, and half its length. */
const ROLLER_REACH = 16;
const ROLLER_HALF = 10;

type Point = { x: number; y: number };

type Bubble = Point & { size: number; flatAt?: number };

type Piece = {
	outline: Point[];
	center: Point;
	stickAt: number;
	peelAt?: number;
	/** Air trapped under the piece, along the line the decorator walks. */
	bubbles: Bubble[];
};

/** A finished row, and when the decorator sets off along it to roll out its bubbles. */
type Row = { y: number; walkAt: number; pieces: Piece[] };

type Colors = { paper: string; ink: string; accent: string };

export const getMshotUrl = ( url: string, attempt = 0 ) =>
	`https://s0.wp.com/mshots/v1/${ encodeURIComponent( url ) }?${ MSHOT_PARAMS }${
		attempt ? `&count=${ attempt }` : ''
	}`;

const random = ( min: number, max: number ) => min + Math.random() * ( max - min );
/** One piece at a time, with a pause of a few seconds after each is flat. */
const getPause = () => random( 3000, 5000 );
const clamp = ( value: number ) => Math.min( Math.max( value, 0 ), 1 );
const easeInCubic = ( t: number ) => t ** 3;

/** A torn line between two points: straight on the page's own edges, ragged inside it. */
function tear( from: Point, to: Point, isEdge: boolean ): Point[] {
	if ( isEdge ) {
		return [ from, to ];
	}
	const length = Math.hypot( to.x - from.x, to.y - from.y );
	const steps = Math.max( 4, Math.round( length / 7 ) );
	const normal = { x: -( to.y - from.y ) / length, y: ( to.x - from.x ) / length };
	const points = [ from ];
	let drift = 0;
	for ( let i = 1; i < steps; i++ ) {
		// A wandering line with small teeth along it, like paper torn by hand.
		drift = drift * 0.6 + random( -2.2, 2.2 );
		const offset = drift + random( -1.2, 1.2 );
		const t = i / steps;
		points.push( {
			x: from.x + ( to.x - from.x ) * t + normal.x * offset,
			y: from.y + ( to.y - from.y ) * t + normal.y * offset,
		} );
	}
	points.push( to );
	return points;
}

/** Whether a point is inside a piece's outline. */
function isInside( point: Point, outline: Point[] ) {
	let inside = false;
	for ( let i = 0, j = outline.length - 1; i < outline.length; j = i++ ) {
		const a = outline[ i ];
		const b = outline[ j ];
		if (
			a.y > point.y !== b.y > point.y &&
			point.x < ( ( b.x - a.x ) * ( point.y - a.y ) ) / ( b.y - a.y ) + a.x
		) {
			inside = ! inside;
		}
	}
	return inside;
}

/** A few small bubbles in a piece, close enough to the row's middle for the roller to reach. */
function trapAir( outline: Point[], lineY: number ): Bubble[] {
	const xs = outline.map( ( point ) => point.x );
	const left = Math.min( ...xs );
	const right = Math.max( ...xs );
	const bubbles: Bubble[] = [];
	for ( let tries = 0; tries < 12 && bubbles.length < 2; tries++ ) {
		const bubble = {
			x: random( left + 10, right - 10 ),
			y: lineY + random( -6, 6 ),
			size: random( 3, 5.5 ),
		};
		if ( isInside( bubble, outline ) ) {
			bubbles.push( bubble );
		}
	}
	return bubbles;
}

/**
 * Cuts the page into torn pieces that fit back together, and sets them going row by row, left to
 * right, with a decorator rolling along each row once it's done.
 */
function cutPieces( width: number, height: number, start: number ): Row[] {
	const cellWidth = width / COLUMNS;
	const cellHeight = height / ROWS;
	const corners: Point[][] = [];
	for ( let row = 0; row <= ROWS; row++ ) {
		corners.push( [] );
		for ( let column = 0; column <= COLUMNS; column++ ) {
			const isInsideX = column > 0 && column < COLUMNS;
			const isInsideY = row > 0 && row < ROWS;
			corners[ row ].push( {
				x: column * cellWidth + ( isInsideX ? random( -0.28, 0.28 ) * cellWidth : 0 ),
				y: row * cellHeight + ( isInsideY ? random( -0.28, 0.28 ) * cellHeight : 0 ),
			} );
		}
	}

	// Each tear is shared by the two pieces on either side of it, so they fit.
	const across = corners.map( ( line, row ) =>
		line
			.slice( 0, -1 )
			.map( ( corner, column ) => tear( corner, line[ column + 1 ], row === 0 || row === ROWS ) )
	);
	const down = corners
		.slice( 0, -1 )
		.map( ( line, row ) =>
			line.map( ( corner, column ) =>
				tear( corner, corners[ row + 1 ][ column ], column === 0 || column === COLUMNS )
			)
		);

	const rows: Row[] = [];
	let next = start;
	for ( let row = 0; row < ROWS; row++ ) {
		const lineY = ( row + 0.5 ) * cellHeight;
		const pieces: Piece[] = [];
		for ( let column = 0; column < COLUMNS; column++ ) {
			const outline = [
				...across[ row ][ column ],
				...down[ row ][ column + 1 ].slice( 1 ),
				...[ ...across[ row + 1 ][ column ] ].reverse().slice( 1 ),
				...[ ...down[ row ][ column ] ].reverse().slice( 1, -1 ),
			];
			const piece: Piece = {
				outline,
				center: {
					x: outline.reduce( ( sum, point ) => sum + point.x, 0 ) / outline.length,
					y: outline.reduce( ( sum, point ) => sum + point.y, 0 ) / outline.length,
				},
				stickAt: next,
				bubbles: trapAir( outline, lineY ),
			};
			pieces.push( piece );
			next += UNROLL_DURATION + getPause();
		}
		const last = pieces[ pieces.length - 1 ];
		rows.push( { y: lineY, walkAt: last.stickAt + UNROLL_DURATION + 500, pieces } );
	}
	return rows;
}

function trace( context: CanvasRenderingContext2D, outline: Point[] ) {
	context.beginPath();
	outline.forEach( ( point, index ) =>
		index ? context.lineTo( point.x, point.y ) : context.moveTo( point.x, point.y )
	);
	context.closePath();
}

/** How much of a piece is unrolled, left to right, from none (0) to flat (1). */
function getUnrolled( piece: Piece, now: number ) {
	if ( piece.peelAt !== undefined && now >= piece.peelAt && now < piece.stickAt ) {
		const rollUp = easeInCubic( clamp( ( now - piece.peelAt ) / UNROLL_DURATION ) );
		return 1 - rollUp;
	}
	return easeInCubic( clamp( ( now - piece.stickAt ) / UNROLL_DURATION ) );
}

function getColors( element: Element ): Colors {
	const style = getComputedStyle( element );
	const read = ( name: string, fallback: string ) =>
		style.getPropertyValue( name ).trim() || fallback;
	return {
		paper: read( '--color-surface', 'white' ),
		ink: read( '--color-text', 'black' ),
		accent: read( '--wp-admin-theme-color', '#3858e9' ),
	};
}

/** A small blister of trapped air, which sinks flat once the roller passes over it. */
function drawBubble(
	context: CanvasRenderingContext2D,
	bubble: Bubble,
	now: number,
	colors: Colors
) {
	const flatten = bubble.flatAt === undefined ? 0 : clamp( ( now - bubble.flatAt ) / 220 );
	const radius = bubble.size * ( 1 - flatten );
	if ( radius < 0.3 ) {
		return;
	}
	context.save();
	context.globalAlpha = 0.14;
	context.fillStyle = colors.ink;
	context.beginPath();
	context.ellipse( bubble.x + 0.6, bubble.y + 1, radius, radius * 0.85, 0, 0, Math.PI * 2 );
	context.fill();
	context.globalAlpha = 0.45;
	context.fillStyle = colors.paper;
	context.beginPath();
	context.ellipse( bubble.x, bubble.y, radius, radius * 0.85, 0, 0, Math.PI * 2 );
	context.fill();
	context.globalAlpha = 0.7;
	context.beginPath();
	context.arc( bubble.x - radius * 0.35, bubble.y - radius * 0.35, radius * 0.25, 0, Math.PI * 2 );
	context.fill();
	context.restore();
}

/**
 * A tiny decorator seen from above, in a WordPress-blue hard hat, pushing a roller along a row.
 * `stride` is how far they've walked, which sets their steps and sway.
 */
function drawDecorator(
	context: CanvasRenderingContext2D,
	at: Point,
	stride: number,
	scale: number,
	colors: Colors
) {
	const step = Math.sin( stride / 5 );
	context.save();
	context.transform( 1, 0, 0, 1, at.x, at.y );
	context.scale( scale, scale );
	context.rotate( step * 0.04 );
	context.lineCap = 'round';
	context.lineJoin = 'round';

	// Their shadow, and their feet stepping out from under them.
	context.globalAlpha = 0.12;
	context.fillStyle = colors.ink;
	context.beginPath();
	context.ellipse( 1, 1.5, 7, 9, 0, 0, Math.PI * 2 );
	context.fill();
	context.globalAlpha = 0.45;
	context.beginPath();
	context.ellipse( 2 + step * 3, -3.5, 2.6, 1.7, 0, 0, Math.PI * 2 );
	context.ellipse( 2 - step * 3, 3.5, 2.6, 1.7, 0, 0, Math.PI * 2 );
	context.fill();
	context.globalAlpha = 1;

	// Soft grey lines rather than the text's full dark, so they sit lightly on the page.
	const outline = () => {
		context.globalAlpha = 0.5;
		context.stroke();
		context.globalAlpha = 1;
	};

	// Arms out to the handle, and the roller across the row.
	context.strokeStyle = colors.ink;
	context.lineWidth = 1.3;
	context.beginPath();
	context.moveTo( 0, -6 );
	context.lineTo( 9, -1.5 );
	context.moveTo( 0, 6 );
	context.lineTo( 9, 1.5 );
	context.moveTo( 9, 0 );
	context.lineTo( ROLLER_REACH - 2.5, 0 );
	outline();
	context.fillStyle = colors.paper;
	context.beginPath();
	context.roundRect( ROLLER_REACH - 2.5, -ROLLER_HALF, 5, ROLLER_HALF * 2, 2 );
	context.fill();
	outline();

	// Shoulders, then the hard hat on top.
	context.beginPath();
	context.ellipse( 0, 0, 4.2, 7.5, 0, 0, Math.PI * 2 );
	context.fill();
	outline();
	context.fillStyle = colors.accent;
	context.beginPath();
	context.ellipse( 0.6, 0, 4.4, 4, 0, 0, Math.PI * 2 );
	context.fill();
	context.globalAlpha = 0.5;
	context.fillStyle = colors.paper;
	context.beginPath();
	context.arc( -0.6, -1.4, 1.1, 0, Math.PI * 2 );
	context.fill();
	context.restore();
}

/** A piece unrolled as far as it has got, with the rest still rolled up at its leading edge. */
function drawPiece(
	context: CanvasRenderingContext2D,
	piece: Piece,
	shot: CanvasImageSource,
	width: number,
	height: number,
	now: number,
	colors: Colors
) {
	const unrolled = getUnrolled( piece, now );
	if ( unrolled <= 0 ) {
		return;
	}
	// Where the piece starts and ends, and where the roll has got to.
	const xs = piece.outline.map( ( point ) => point.x );
	const start = Math.min( ...xs ) - 4;
	const end = Math.max( ...xs ) + 4;
	const edge = start + ( end - start ) * unrolled;
	// The roll thins as the paper comes off it.
	const radius = 2 + ROLL_RADIUS * Math.sqrt( 1 - unrolled );

	context.save();
	trace( context, piece.outline );
	context.clip();

	// The flat part, as far as the roll has got.
	context.save();
	context.beginPath();
	context.rect( start - 1, 0, edge - start + 1, height );
	context.clip();
	context.drawImage( shot, 0, 0, width, height );
	// The bubbles are under the paper, so they come out with it as it unrolls.
	piece.bubbles.forEach( ( bubble ) => drawBubble( context, bubble, now, colors ) );
	// The white fibres along a torn edge, with the faint line where the paper split.
	context.lineJoin = 'round';
	context.strokeStyle = colors.paper;
	context.lineWidth = 3.5;
	trace( context, piece.outline );
	context.stroke();
	context.globalAlpha = 0.15;
	context.strokeStyle = colors.ink;
	context.lineWidth = 0.75;
	context.stroke();
	context.restore();

	if ( unrolled < 1 ) {
		// The shadow the roll casts on the page ahead of it.
		context.globalAlpha = 0.12;
		context.fillStyle = colors.ink;
		context.fillRect( edge, 0, radius * 2 + 4, height );
		// The roll: the back of the paper, shaded like a cylinder.
		context.globalAlpha = 1;
		context.fillStyle = colors.paper;
		context.fillRect( edge, 0, radius * 2, height );
		// Toned down a touch, so even the highlight is a little off-white.
		context.globalAlpha = 0.05;
		context.fillStyle = colors.ink;
		context.fillRect( edge, 0, radius * 2, height );
		const shading = context.createLinearGradient( edge, 0, edge + radius * 2, 0 );
		// The highlight drifts across the roll as it turns, so it reads as rolling, not sliding.
		const highlight = 0.3 + 0.25 * unrolled + 0.06 * Math.sin( ( edge - start ) / radius );
		shading.addColorStop( 0, colors.ink );
		shading.addColorStop( highlight, colors.paper );
		shading.addColorStop( 1, colors.ink );
		context.globalAlpha = 0.13;
		context.fillStyle = shading;
		context.fillRect( edge, 0, radius * 2, height );
	}
	context.restore();
}

/** The site's screenshot, scaled once to the canvas so each frame only copies pixels. */
function fitShot( image: HTMLImageElement, width: number, height: number, ratio: number ) {
	const fitted = document.createElement( 'canvas' );
	fitted.width = Math.round( width * ratio );
	fitted.height = Math.round( height * ratio );
	const context = fitted.getContext( '2d' );
	if ( ! context ) {
		return image;
	}
	// Fills the width and keeps the top of the page, like the screenshot that replaces it.
	const sourceWidth = Math.min( image.naturalWidth, ( image.naturalHeight * width ) / height );
	const sourceHeight = ( sourceWidth * height ) / width;
	context.drawImage( image, 0, 0, sourceWidth, sourceHeight, 0, 0, fitted.width, fitted.height );
	return fitted;
}

/**
 * The site's home page, torn into pieces that unroll into place one at a time, row by row, left to
 * right. After each row, a tiny decorator rolls out its bubbles. Pieces then roll back up and
 * unroll again, so there's something moving while the site's pages are found.
 */
export function TornCollage( { url }: { url: string } ) {
	const canvasRef = useRef< HTMLCanvasElement >( null );

	useEffect( () => {
		const canvas = canvasRef.current;
		if ( ! canvas || ! url ) {
			return;
		}
		let frame = 0;
		let retry: number | undefined;
		let isGone = false;
		let stopAnimating: ( () => void ) | undefined;
		const image = new Image();

		const start = () => {
			const context = canvas.getContext( '2d' );
			const frameElement = canvas.parentElement;
			if ( ! context || ! frameElement ) {
				return;
			}
			const isStill = window.matchMedia?.( '(prefers-reduced-motion: reduce)' ).matches;
			let width = 0;
			let height = 0;
			let shot: CanvasImageSource = image;
			let rows: Row[] = [];
			let pieces: Piece[] = [];
			let nextPeel = 0;
			const colors = getColors( canvas );

			const layout = () => {
				const ratio = window.devicePixelRatio || 1;
				// Sized by the window it fills, since the canvas's own size follows what's drawn on it.
				width = frameElement.clientWidth;
				height = frameElement.clientHeight;
				if ( ! width || ! height ) {
					return;
				}
				canvas.width = Math.round( width * ratio );
				canvas.height = Math.round( height * ratio );
				context.setTransform( ratio, 0, 0, ratio, 0, 0 );
				shot = fitShot( image, width, height, ratio );
				const now = performance.now();
				rows = cutPieces( width, height, isStill ? -Infinity : now );
				pieces = rows.flatMap( ( row ) => row.pieces );
				if ( isStill ) {
					pieces.forEach( ( piece ) => ( piece.bubbles = [] ) );
				}
				nextPeel =
					Math.max( ...pieces.map( ( piece ) => piece.stickAt ) ) + UNROLL_DURATION + getPause();
			};

			const draw = ( now: number ) => {
				// A faintly shaded board, so the gaps left by missing pieces show.
				context.globalAlpha = 1;
				context.fillStyle = colors.paper;
				context.fillRect( 0, 0, width, height );
				context.globalAlpha = 0.05;
				context.fillStyle = colors.ink;
				context.fillRect( 0, 0, width, height );
				context.globalAlpha = 1;

				if ( ! isStill && now >= nextPeel && pieces.length ) {
					// One piece rolls back up, then unrolls again.
					const piece = pieces[ Math.floor( Math.random() * pieces.length ) ];
					piece.peelAt = now;
					piece.bubbles = [];
					piece.stickAt = now + UNROLL_DURATION + 250;
					nextPeel = piece.stickAt + UNROLL_DURATION + getPause();
				}

				// The most recently stuck pieces go on top of the older ones.
				[ ...pieces ]
					.sort( ( a, b ) => a.stickAt - b.stickAt )
					.forEach( ( piece ) => drawPiece( context, piece, shot, width, height, now, colors ) );

				// Along each finished row, the decorator walks the roller over the bubbles.
				const scale = Math.min( Math.max( width / 640, 0.8 ), 1.2 );
				rows.forEach( ( row ) => {
					if ( isStill || now < row.walkAt ) {
						return;
					}
					const stride = ( now - row.walkAt ) * WALK_SPEED;
					const at = { x: -30 + stride, y: row.y };
					if ( at.x > width + 40 ) {
						return;
					}
					const roller = at.x + ROLLER_REACH * scale;
					row.pieces.forEach( ( piece ) =>
						piece.bubbles.forEach( ( bubble ) => {
							if ( bubble.flatAt === undefined && roller >= bubble.x ) {
								bubble.flatAt = now;
							}
						} )
					);
					drawDecorator( context, at, stride, scale, colors );
				} );
				if ( ! isStill ) {
					frame = requestAnimationFrame( draw );
				}
			};

			layout();
			draw( performance.now() );
			const observer = new ResizeObserver( () => {
				cancelAnimationFrame( frame );
				layout();
				draw( performance.now() );
			} );
			observer.observe( frameElement );
			stopAnimating = () => observer.disconnect();
		};

		let attempt = 0;
		image.onload = () => {
			if ( isGone ) {
				return;
			}
			const isPlaceholder =
				image.naturalWidth === MSHOT_PLACEHOLDER.width &&
				image.naturalHeight === MSHOT_PLACEHOLDER.height;
			if ( ! isPlaceholder ) {
				start();
			} else if ( attempt < MSHOT_TRIES ) {
				attempt++;
				retry = window.setTimeout( () => {
					image.src = getMshotUrl( url, attempt );
				}, attempt * 1000 );
			}
		};
		image.src = getMshotUrl( url );

		return () => {
			isGone = true;
			image.onload = null;
			clearTimeout( retry );
			cancelAnimationFrame( frame );
			stopAnimating?.();
		};
	}, [ url ] );

	return (
		<canvas ref={ canvasRef } className="static-site-import-snapshot__collage" aria-hidden="true" />
	);
}
