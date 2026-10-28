/**
 * A CSS `linear-gradient()`, as a computed `background-image` gives it,
 * evaluated at a point: what a cover's gradient overlay paints behind a
 * stretch of text.
 *
 * Only what can be worked out exactly is read: one linear gradient, its
 * direction as a side, a corner or an angle, and colour stops placed by
 * percentage or pixels. A repeating, radial or conic gradient, a colour hint,
 * an interpolation colour space, a `calc()` or a layered background parses as
 * `null`, so the text over it is left to the picture rather than measured
 * against a guess.
 */

export interface Rgba {
	r: number;
	g: number;
	b: number;
	a: number;
}

interface Box {
	left: number;
	top: number;
	width: number;
	height: number;
}

export interface LinearGradient {
	/** The colour painted at a point, in the same coordinates as the box. */
	colourAt: ( x: number, y: number ) => Rgba;
}

interface Stop {
	colour: Rgba;
	/** Along the gradient line, in pixels from its start; `null` until filled in. */
	position: number | null;
}

const SIDES: Record< string, [ number, number ] > = {
	top: [ 0, -1 ],
	bottom: [ 0, 1 ],
	left: [ -1, 0 ],
	right: [ 1, 0 ],
};

const ANGLE_UNITS: Record< string, number > = {
	deg: Math.PI / 180,
	grad: Math.PI / 200,
	rad: 1,
	turn: Math.PI * 2,
};

// A colour as a computed style serialises it, and whatever follows it.
const STOP_PATTERN = /^(rgba?\([^)]*\)|color\([^)]*\)|transparent|#[0-9a-f]+)\s*(.*)$/i;

/** Splits on the commas that are not inside parentheses. */
function splitTopLevel( value: string ): string[] {
	const parts: string[] = [];
	let depth = 0;
	let start = 0;

	for ( let index = 0; index < value.length; index++ ) {
		const character = value[ index ];

		if ( character === '(' ) {
			depth++;
		} else if ( character === ')' ) {
			depth--;
		} else if ( character === ',' && depth === 0 ) {
			parts.push( value.slice( start, index ).trim() );
			start = index + 1;
		}
	}

	parts.push( value.slice( start ).trim() );

	return parts;
}

/**
 * The unit vector the gradient runs along, in screen coordinates with y down,
 * or `null` for a direction that cannot be read.
 */
function readDirection( value: string, box: Box ): [ number, number ] | null {
	const angle = /^(-?[\d.]+)(deg|grad|rad|turn)$/.exec( value );

	// 0deg points up, and angles turn clockwise.
	if ( angle ) {
		const radians = parseFloat( angle[ 1 ] ) * ANGLE_UNITS[ angle[ 2 ] ];

		return [ Math.sin( radians ), -Math.cos( radians ) ];
	}

	const sides = /^to\s+(top|bottom|left|right)(?:\s+(top|bottom|left|right))?$/.exec( value );

	if ( ! sides ) {
		return null;
	}

	const [ x1, y1 ] = SIDES[ sides[ 1 ] ];
	const [ x2, y2 ] = sides[ 2 ] ? SIDES[ sides[ 2 ] ] : [ 0, 0 ];
	const x = x1 + x2;
	const y = y1 + y2;

	// Two sides on one axis, as `to left right`.
	if ( ! x && ! y ) {
		return null;
	}

	if ( ! x || ! y ) {
		return [ x, y ];
	}

	// Towards a corner, the line is perpendicular to the diagonal joining the
	// two corners either side of it, so it depends on the box's proportions.
	const length = Math.hypot( box.height, box.width );

	return [ ( x * box.height ) / length, ( y * box.width ) / length ];
}

/** A stop position in pixels along a line `length` long, or `null` if it cannot be read. */
function readPosition( value: string, length: number ): number | null {
	const match = /^(-?[\d.]+)(%|px)$/.exec( value );

	if ( ! match ) {
		return null;
	}

	return match[ 2 ] === '%'
		? ( parseFloat( match[ 1 ] ) / 100 ) * length
		: parseFloat( match[ 1 ] );
}

/**
 * Fills in stop positions the way CSS does: the first at the start and the
 * last at the end when unset, each at least as far as the one before it, and
 * the rest spread evenly between the stops on either side.
 */
function placeStops( stops: Stop[], length: number ): { colour: Rgba; position: number }[] {
	stops[ 0 ].position ??= 0;
	stops[ stops.length - 1 ].position ??= length;

	let furthest = -Infinity;

	stops.forEach( ( stop ) => {
		if ( stop.position !== null ) {
			stop.position = Math.max( stop.position, furthest );
			furthest = stop.position;
		}
	} );

	for ( let index = 1; index < stops.length; index++ ) {
		if ( stops[ index ].position !== null ) {
			continue;
		}

		const before = index - 1;
		let after = index;

		while ( stops[ after ].position === null ) {
			after++;
		}

		const from = stops[ before ].position as number;
		const to = stops[ after ].position as number;

		for ( let gap = index; gap < after; gap++ ) {
			stops[ gap ].position = from + ( ( to - from ) * ( gap - before ) ) / ( after - before );
		}
	}

	return stops as { colour: Rgba; position: number }[];
}

/** Between two colours as browsers blend gradient stops: premultiplied by alpha. */
function mix( from: Rgba, to: Rgba, amount: number ): Rgba {
	const a = from.a + ( to.a - from.a ) * amount;
	const channel = ( start: number, end: number ) =>
		a > 0 ? ( start * from.a + ( end * to.a - start * from.a ) * amount ) / a : 0;

	return { r: channel( from.r, to.r ), g: channel( from.g, to.g ), b: channel( from.b, to.b ), a };
}

/**
 * The gradient a computed `background-image` holds, laid out over `box`, or
 * `null` when it is not one linear gradient that can be worked out exactly.
 * @param value       The computed `background-image`.
 * @param box         The element's box, in the coordinates points will be given in.
 * @param parseColour Reads a computed colour, `null` when it cannot.
 * @returns The gradient, or `null`.
 */
export function parseLinearGradient(
	value: string,
	box: Box,
	parseColour: ( value: string ) => Rgba | null
): LinearGradient | null {
	const layers = splitTopLevel( value.trim() );
	const match = layers.length === 1 && /^linear-gradient\((.*)\)$/s.exec( layers[ 0 ] );

	if ( ! match || ! box.width || ! box.height ) {
		return null;
	}

	const parts = splitTopLevel( match[ 1 ] );
	let direction: [ number, number ] = [ 0, 1 ];

	if ( ! STOP_PATTERN.test( parts[ 0 ] ) ) {
		const read = readDirection( parts.shift() as string, box );

		if ( ! read ) {
			return null;
		}

		direction = read;
	}

	const [ dx, dy ] = direction;
	const length = Math.abs( box.width * dx ) + Math.abs( box.height * dy );
	const stops: Stop[] = [];

	for ( const part of parts ) {
		const stop = STOP_PATTERN.exec( part );
		const colour = stop && parseColour( stop[ 1 ] );

		// A bare position is a colour hint, which bends the blend between two
		// stops in a way not modelled here.
		if ( ! stop || ! colour ) {
			return null;
		}

		const positions = stop[ 2 ] ? stop[ 2 ].split( /\s+/ ) : [];

		if ( positions.length > 2 ) {
			return null;
		}

		if ( ! positions.length ) {
			stops.push( { colour, position: null } );
		}

		for ( const position of positions ) {
			const pixels = readPosition( position, length );

			if ( pixels === null ) {
				return null;
			}

			stops.push( { colour, position: pixels } );
		}
	}

	if ( stops.length < 2 ) {
		return null;
	}

	const placed = placeStops( stops, length );
	const centreX = box.left + box.width / 2;
	const centreY = box.top + box.height / 2;

	return {
		colourAt: ( x, y ) => {
			const along = ( x - centreX ) * dx + ( y - centreY ) * dy + length / 2;
			const first = placed[ 0 ];
			const last = placed[ placed.length - 1 ];

			if ( along <= first.position ) {
				return first.colour;
			}

			if ( along >= last.position ) {
				return last.colour;
			}

			const next = placed.findIndex( ( stop ) => stop.position > along );
			const from = placed[ next - 1 ];
			const to = placed[ next ];

			return mix(
				from.colour,
				to.colour,
				( along - from.position ) / ( to.position - from.position )
			);
		},
	};
}
