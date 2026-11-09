jest.mock( '../../block-ids', () => ( {
	// A block the agent was never shown has no short id; these tests name such blocks `long-…`.
	createShortIdLookup: () => ( {
		findShortId: ( clientId: string ) => ( clientId.startsWith( 'long-' ) ? undefined : clientId ),
	} ),
} ) );
jest.mock( '../../editor-blocks', () => ( {
	getBlock: jest.fn(),
	getBlocks: jest.fn(),
	getPaletteColors: jest.fn(),
} ) );

import { getBlock, getBlocks, getPaletteColors } from '../../editor-blocks';
import { describeTextContrast } from '../contrast';
import { rememberImagePixels } from '../image-pixels';
import type { BlockAttributes, EditorBlock } from '../../editor-blocks';

type Styles = Partial< Record< keyof CSSStyleDeclaration, string > >;

interface Rect {
	top: number;
	left: number;
	width: number;
	height: number;
}

const withRect = < T extends Element >( element: T, { top, left, width, height }: Rect ): T => {
	element.getBoundingClientRect = () =>
		( { top, left, width, height, bottom: top + height, right: left + width } ) as DOMRect;

	return element;
};

interface CanvasBlock {
	clientId: string;
	name: string;
	attributes?: BlockAttributes;
	/** Inline styles on the block's own element. */
	style?: Styles;
	/** The block's own box, which jsdom does not lay out. */
	rect?: Rect;
	/**
	 * Computed styles on the block's own element, keyed by pseudo-element or
	 * `''`, for what jsdom does not compute: gradients, newer colour syntax and
	 * pseudo-elements.
	 */
	computed?: Record< string, Styles >;
	text?: string;
	/** Inline styles on the element holding the text, which jsdom does not inherit into. */
	textStyle?: Styles;
	/** Computed styles on the element holding the text. */
	textComputed?: Styles;
	/** The text's box, which jsdom does not lay out. */
	textRect?: Rect;
	/** Adds markup of the block's own besides its text, such as a cover's overlay. */
	build?: ( element: HTMLElement, canvasDocument: Document ) => void;
	children?: CanvasBlock[];
}

/** Mounts the canvas with the blocks styled as given, and the editor store to match. */
function mountCanvas( roots: CanvasBlock[] ) {
	document.body.innerHTML = '';

	const frame = document.createElement( 'iframe' );
	frame.name = 'editor-canvas';
	document.body.append( frame );

	const canvasDocument = frame.contentDocument as Document;
	const store: Record< string, CanvasBlock > = {};
	const computed = new Map< Element, Record< string, Styles > >();

	const mount = ( block: CanvasBlock, container: HTMLElement ) => {
		const element = canvasDocument.createElement( 'div' );
		element.setAttribute( 'data-block', block.clientId );
		Object.assign( element.style, block.style );

		if ( block.rect ) {
			withRect( element, block.rect );
		}

		if ( block.computed ) {
			computed.set( element, block.computed );
		}

		block.build?.( element, canvasDocument );

		if ( block.text ) {
			const span = canvasDocument.createElement( 'span' );
			Object.assign( span.style, block.textStyle );
			span.append( block.text );
			element.append( span );

			if ( block.textComputed ) {
				computed.set( span, { '': block.textComputed } );
			}

			if ( block.textRect ) {
				withRect( span, block.textRect );
			}
		}

		container.append( element );
		store[ block.clientId ] = block;
		block.children?.forEach( ( child ) => mount( child, element ) );
	};

	roots.forEach( ( root ) => mount( root, canvasDocument.body ) );

	const view = canvasDocument.defaultView as Window;
	const getComputedStyle = view.getComputedStyle.bind( view );

	jest.spyOn( view, 'getComputedStyle' ).mockImplementation( ( element, pseudo ) => {
		// jsdom computes no pseudo-elements: none is generated unless a test says so.
		const style = getComputedStyle( pseudo ? canvasDocument.createElement( 'span' ) : element );
		const overrides = {
			...( pseudo && { content: 'none' } ),
			...computed.get( element )?.[ pseudo ?? '' ],
		};

		Object.entries( overrides ).forEach( ( [ property, value ] ) =>
			Object.defineProperty( style, property, { value } )
		);

		return style;
	} );

	const toEditorBlock = ( block: CanvasBlock ): EditorBlock => ( {
		clientId: block.clientId,
		name: block.name,
		attributes: block.attributes ?? {},
		innerBlocks: ( block.children ?? [] ).map( toEditorBlock ),
	} );

	jest
		.mocked( getBlock )
		.mockImplementation( ( id ) => store[ id ] && toEditorBlock( store[ id ] ) );
	jest
		.mocked( getBlocks )
		.mockImplementation( ( id ) => ( id && store[ id ]?.children?.map( toEditorBlock ) ) || [] );
}

const PALE = 'rgb(243, 240, 234)';
const NAVY = 'rgb(29, 38, 48)';
const NAVY_TEXT = { color: 'rgb(20, 33, 61)', fontSize: '16px' };
const GREY_TEXT = { color: 'rgb(119, 119, 119)', fontSize: '16px' };
const WHITE_TEXT = { color: 'rgb(255, 255, 255)', fontSize: '16px' };

const UNMEASURED_ONE =
	'Contrast could not be measured for 1 edited text block(s), whose text sits over an image or gradient or uses a colour that cannot be read; judge those from the picture.';

// The unmeasured note, with why the block over the cover was left to the picture.
const skippedOver = ( label: string, reason: string ) =>
	`${ UNMEASURED_ONE } Of those, ${ label } sits over cover (hero), where ${ reason }.`;
const UNREADABLE =
	"its photograph's pixels could not be read, as when it has not loaded or its host does not allow it";
const PLACEMENT = 'where its photograph sits behind the text cannot be worked out';

const section = ( children: CanvasBlock[] ): CanvasBlock => ( {
	clientId: 'sect',
	name: 'core/group',
	attributes: { style: { color: { background: '#f3f0ea', text: '#14213d' } } },
	style: { backgroundColor: PALE },
	children,
} );

const text = ( clientId: string, textStyle: Styles = NAVY_TEXT ): CanvasBlock => ( {
	clientId,
	name: 'core/paragraph',
	text: 'Some text',
	textStyle,
} );

const notesOf = ( clientIds: string[] ) => describeTextContrast( clientIds )?.notes ?? [];

beforeEach( () => {
	jest.mocked( getPaletteColors ).mockReturnValue( [] );
} );

afterEach( () => {
	document.body.innerHTML = '';
	jest.resetAllMocks();
} );

describe( 'failures', () => {
	it( 'names the text sitting on a group the theme paints dark, and not the text on the section', () => {
		mountCanvas( [
			section( [
				{
					clientId: 'c25n',
					name: 'core/group',
					style: { backgroundColor: NAVY },
					children: [
						{ clientId: 'ueo8', name: 'core/heading', text: 'Welcome', textStyle: NAVY_TEXT },
						{ clientId: 'qalw', name: 'core/paragraph', text: 'Hello there', textStyle: NAVY_TEXT },
					],
				},
				{ clientId: 'pale', name: 'core/paragraph', text: 'Readable', textStyle: NAVY_TEXT },
			] ),
		] );

		expect( describeTextContrast( [ 'sect' ] ) ).toEqual( {
			notes: [
				'Text contrast too low: heading (ueo8) and paragraph (qalw) — #14213D text on #1D2630, 1.04:1 (needs 4.5:1). The #1D2630 comes from group (c25n), which sets no background of its own, so the colour comes from the theme or global styles.',
			],
			failures: 2,
			backdrops: [
				{
					clientId: 'c25n',
					name: 'core/group',
					ownBackground: false,
					textClientIds: [ 'ueo8', 'qalw' ],
					readableText: '#FFFFFF',
				},
			],
		} );
	} );

	it( 'says when the backdrop is the group’s own background', () => {
		mountCanvas( [
			{
				clientId: 'c25n',
				name: 'core/group',
				attributes: { backgroundColor: 'contrast' },
				style: { backgroundColor: NAVY },
				children: [ text( 'qalw' ) ],
			},
		] );

		expect( notesOf( [ 'c25n' ] ) ).toEqual( [
			"Text contrast too low: paragraph (qalw) — #14213D text on #1D2630, 1.04:1 (needs 4.5:1). The #1D2630 comes from group (c25n)'s own background.",
		] );
	} );

	it( 'says when nothing paints the backdrop, and rounds a ratio just short of the threshold down', () => {
		mountCanvas( [ text( 'grey', GREY_TEXT ) ] );

		expect( notesOf( [ 'grey' ] ) ).toEqual( [
			'Text contrast too low: paragraph (grey) — #777777 text on #FFFFFF, 4.47:1 (needs 4.5:1). The #FFFFFF comes from the page background.',
		] );
	} );

	it( 'layers semi-transparent colours, read in space and srgb syntax', () => {
		// Half-black over the pale section is #7A7875; half-#333333 text over that is #565654.
		mountCanvas( [
			section( [
				{
					clientId: 'tint',
					name: 'core/group',
					computed: { '': { backgroundColor: 'rgb(0 0 0 / 50%)' } },
					children: [
						{
							...text( 'qalw' ),
							textComputed: { color: 'color(srgb 0.2 0.2 0.2 / 0.5)' },
						},
					],
				},
			] ),
		] );

		expect( notesOf( [ 'sect' ] ) ).toEqual( [
			'Text contrast too low: paragraph (qalw) — #565654 text on #7A7875, 1.67:1 (needs 4.5:1). The #7A7875 comes from group (tint), which sets no background of its own, so the colour comes from the theme or global styles.',
		] );
	} );

	it( 'holds large text to 3:1 and the rest to 4.5:1', () => {
		// rgb(130, 130, 130) on white is 3.84:1.
		const mid = 'rgb(130, 130, 130)';

		mountCanvas( [
			text( 'big', { color: mid, fontSize: '24px' } ),
			text( 'bold', { color: mid, fontSize: '19px', fontWeight: '700' } ),
			text( 'body', { color: mid, fontSize: '19px' } ),
		] );

		expect( notesOf( [ 'big', 'bold', 'body' ] ) ).toEqual( [
			expect.stringMatching(
				/^Text contrast too low: paragraph \(body\) — #828282 text on #FFFFFF, 3\.84:1 \(needs 4\.5:1\)/
			),
		] );
	} );

	it( 'states the strictest threshold when large and body text share a failure', () => {
		mountCanvas( [
			{
				clientId: 'c25n',
				name: 'core/group',
				style: { backgroundColor: NAVY },
				children: [
					{
						clientId: 'ueo8',
						name: 'core/heading',
						text: 'Welcome',
						textStyle: { ...NAVY_TEXT, fontSize: '40px' },
					},
					text( 'qalw' ),
				],
			},
		] );

		expect( notesOf( [ 'c25n' ] ) ).toEqual( [
			expect.stringContaining(
				'heading (ueo8) and paragraph (qalw) — #14213D text on #1D2630, 1.04:1 (needs 4.5:1).'
			),
		] );
	} );

	it( 'gives a row of buttons with the same background of their own one note', () => {
		// In the editor run this was written for, each button was its own note,
		// and the cap dropped two of the three before the correction.
		const button = ( clientId: string ): CanvasBlock => ( {
			...text( clientId, WHITE_TEXT ),
			name: 'core/button',
			attributes: { backgroundColor: 'terracotta' },
			style: { backgroundColor: 'rgb(201, 111, 74)' },
		} );

		mountCanvas( [ button( 'pd19' ), button( 'pz9d' ), button( 'mnyk' ) ] );

		expect( describeTextContrast( [ 'pd19', 'pz9d', 'mnyk' ] ) ).toEqual( {
			notes: [
				"Text contrast too low: button (pd19), button (pz9d) and button (mnyk) — #FFFFFF text on #C96F4A, 3.58:1 (needs 4.5:1). The #C96F4A comes from each block's own background.",
			],
			failures: 3,
			backdrops: [
				{
					clientId: 'pd19',
					name: 'core/button',
					ownBackground: true,
					textClientIds: [ 'pd19' ],
					readableText: '#000000',
				},
				{
					clientId: 'pz9d',
					name: 'core/button',
					ownBackground: true,
					textClientIds: [ 'pz9d' ],
					readableText: '#000000',
				},
				{
					clientId: 'mnyk',
					name: 'core/button',
					ownBackground: true,
					textClientIds: [ 'mnyk' ],
					readableText: '#000000',
				},
			],
		} );
	} );

	it( 'gives a row of buttons coloured by the theme one note too', () => {
		// Most block themes colour buttons from global styles, so the buttons
		// set no background of their own and each paints the theme's behind its text.
		const button = ( clientId: string ): CanvasBlock => ( {
			...text( clientId, WHITE_TEXT ),
			name: 'core/button',
			style: { backgroundColor: 'rgb(201, 111, 74)' },
		} );

		mountCanvas( [ button( 'pd19' ), button( 'pz9d' ), button( 'mnyk' ) ] );

		expect( describeTextContrast( [ 'pd19', 'pz9d', 'mnyk' ] ) ).toEqual( {
			notes: [
				'Text contrast too low: button (pd19), button (pz9d) and button (mnyk) — #FFFFFF text on #C96F4A, 3.58:1 (needs 4.5:1). The #C96F4A comes from each block itself, which sets no background of its own, so the colour comes from the theme or global styles.',
			],
			failures: 3,
			backdrops: [
				{
					clientId: 'pd19',
					name: 'core/button',
					ownBackground: false,
					textClientIds: [ 'pd19' ],
					readableText: '#000000',
				},
				{
					clientId: 'pz9d',
					name: 'core/button',
					ownBackground: false,
					textClientIds: [ 'pz9d' ],
					readableText: '#000000',
				},
				{
					clientId: 'mnyk',
					name: 'core/button',
					ownBackground: false,
					textClientIds: [ 'mnyk' ],
					readableText: '#000000',
				},
			],
		} );
	} );

	it( 'keeps text on separate theme-painted groups in separate notes', () => {
		// Each group is its own fix, as the inner groups were in WPAGENT-203.
		const group = ( clientId: string, child: string ): CanvasBlock => ( {
			clientId,
			name: 'core/group',
			style: { backgroundColor: NAVY },
			children: [ text( child ) ],
		} );

		mountCanvas( [ group( 'g1', 'p1' ), group( 'g2', 'p2' ) ] );

		expect( notesOf( [ 'g1', 'g2' ] ) ).toEqual( [
			'Text contrast too low: paragraph (p1) — #14213D text on #1D2630, 1.04:1 (needs 4.5:1). The #1D2630 comes from group (g1), which sets no background of its own, so the colour comes from the theme or global styles.',
			'Text contrast too low: paragraph (p2) — #14213D text on #1D2630, 1.04:1 (needs 4.5:1). The #1D2630 comes from group (g2), which sets no background of its own, so the colour comes from the theme or global styles.',
		] );
	} );

	it( 'names each block whose own background a shared note comes from', () => {
		const group = ( clientId: string, child: string ): CanvasBlock => ( {
			clientId,
			name: 'core/group',
			attributes: { backgroundColor: 'contrast' },
			style: { backgroundColor: NAVY },
			children: [ text( child ) ],
		} );

		mountCanvas( [ group( 'g1', 'p1' ), group( 'g2', 'p2' ) ] );

		expect( notesOf( [ 'g1', 'g2' ] ) ).toEqual( [
			'Text contrast too low: paragraph (p1) and paragraph (p2) — #14213D text on #1D2630, 1.04:1 (needs 4.5:1). The #1D2630 comes from the own backgrounds of group (g1) and group (g2).',
		] );
	} );

	it( 'puts the worst failure first and names at most three blocks in a note', () => {
		mountCanvas( [
			text( 'grey', GREY_TEXT ),
			{
				clientId: 'c25n',
				name: 'core/group',
				style: { backgroundColor: NAVY },
				children: [ 'p1', 'p2', 'p3', 'p4', 'p5' ].map( ( id ) => text( id ) ),
			},
		] );

		const notes = notesOf( [ 'grey', 'c25n' ] );

		expect( notes ).toHaveLength( 2 );
		expect( notes[ 0 ] ).toMatch(
			/^Text contrast too low: paragraph \(p1\), paragraph \(p2\), paragraph \(p3\) and 2 more — #14213D text on #1D2630, 1\.04:1/
		);
		expect( notes[ 1 ] ).toMatch( /^Text contrast too low: paragraph \(grey\) — #777777/ );
	} );
} );

it( 'says all the edited text passes when it does', () => {
	mountCanvas( [
		section( [
			{ clientId: 'ueo8', name: 'core/heading', text: 'Welcome', textStyle: NAVY_TEXT },
		] ),
	] );

	expect( describeTextContrast( [ 'sect' ] ) ).toEqual( {
		notes: [
			'Text contrast: all 1 edited text block(s) measure at least 4.5:1 (3:1 for large text) against what renders behind them.',
		],
		failures: 0,
		backdrops: [],
	} );
} );

it( 'gives no count when there is no text to measure', () => {
	mountCanvas( [ { clientId: 'spacer', name: 'core/spacer' } ] );

	expect( describeTextContrast( [ 'spacer' ] ) ).toBeNull();
} );

it( 'says nothing of a block the canvas does not display', () => {
	mountCanvas( [
		{
			clientId: 'gone',
			name: 'core/group',
			style: { display: 'none' },
			children: [ text( 'grey', GREY_TEXT ) ],
		},
	] );

	expect( notesOf( [ 'gone' ] ) ).toEqual( [] );
} );

describe( 'text it cannot measure', () => {
	it( 'leaves text over a gradient to the picture', () => {
		mountCanvas( [
			{
				clientId: 'cover',
				name: 'core/group',
				computed: {
					'': { backgroundImage: 'linear-gradient(rgb(0, 0, 0), rgb(255, 255, 255))' },
				},
				children: [ text( 'ueo8' ) ],
			},
		] );

		expect( describeTextContrast( [ 'cover' ] ) ).toEqual( {
			notes: [ UNMEASURED_ONE ],
			failures: null,
			backdrops: [],
		} );
	} );

	it( 'leaves text over a cover’s overlay to the picture, rather than reading the page behind it', () => {
		// White text on a white page, which would fail, if the overlay were missed.
		mountCanvas( [
			{
				clientId: 'cover',
				name: 'core/cover',
				build: ( element, canvasDocument ) => {
					const overlay = canvasDocument.createElement( 'span' );
					Object.assign( overlay.style, { position: 'absolute', backgroundColor: 'rgb(0, 0, 0)' } );
					element.append( overlay );
				},
				children: [ text( 'ueo8', WHITE_TEXT ) ],
			},
		] );

		expect( notesOf( [ 'cover' ] ) ).toEqual( [ UNMEASURED_ONE ] );
	} );

	it( 'leaves text over a positioned image to the picture', () => {
		mountCanvas( [
			{
				clientId: 'cover',
				name: 'core/cover',
				build: ( element, canvasDocument ) => {
					const image = canvasDocument.createElement( 'img' );
					image.style.position = 'absolute';
					element.append( image );
				},
				children: [ text( 'ueo8', WHITE_TEXT ) ],
			},
		] );

		expect( notesOf( [ 'cover' ] ) ).toEqual( [ UNMEASURED_ONE ] );
	} );

	it( 'leaves text over a painted pseudo-element to the picture', () => {
		mountCanvas( [
			{
				clientId: 'band',
				name: 'core/group',
				computed: {
					'::before': {
						content: '""',
						position: 'absolute',
						backgroundColor: 'rgb(0, 0, 0)',
					},
				},
				children: [ text( 'ueo8', WHITE_TEXT ) ],
			},
		] );

		expect( notesOf( [ 'band' ] ) ).toEqual( [ UNMEASURED_ONE ] );
	} );

	it( 'leaves faded text to the picture', () => {
		mountCanvas( [
			{
				clientId: 'faded',
				name: 'core/group',
				style: { opacity: '0.5' },
				children: [ text( 'ueo8' ) ],
			},
		] );

		expect( notesOf( [ 'faded' ] ) ).toEqual( [ UNMEASURED_ONE ] );
	} );

	it.each( [
		[ 'filtered', { filter: 'brightness(0)' } ],
		[ 'blended', { mixBlendMode: 'difference' } ],
		[ 'behind a backdrop filter', { backdropFilter: 'blur(4px)' } ],
	] )( 'leaves %s text to the picture', ( _, styles ) => {
		// Black on white reads 21:1 from the colours, whatever the filter does to them.
		mountCanvas( [
			{
				clientId: 'altered',
				name: 'core/group',
				computed: { '': styles },
				children: [ text( 'ueo8', { color: 'rgb(0, 0, 0)', fontSize: '16px' } ) ],
			},
		] );

		expect( notesOf( [ 'altered' ] ) ).toEqual( [ UNMEASURED_ONE ] );
	} );

	it( 'measures text on an opaque button behind a backdrop filter', () => {
		// A theme's glass-style buttons blur what is behind them, which their own
		// background hides.
		mountCanvas( [
			{
				...text( 'btn', { color: 'rgb(20, 35, 59)', fontSize: '16px' } ),
				name: 'core/button',
				style: { backgroundColor: 'rgb(194, 65, 12)' },
				computed: { '': { backdropFilter: 'blur(30px)' } },
			},
		] );

		expect( describeTextContrast( [ 'btn' ] ) ).toEqual( {
			notes: [
				'Text contrast too low: button (btn) — #14233B text on #C2410C, 3.04:1 (needs 4.5:1). The #C2410C comes from button (btn), which sets no background of its own, so the colour comes from the theme or global styles.',
			],
			failures: 1,
			backdrops: [
				{
					clientId: 'btn',
					name: 'core/button',
					ownBackground: false,
					textClientIds: [ 'btn' ],
					readableText: '#FFFFFF',
				},
			],
		} );
	} );

	it( 'reads the text fill colour the glyphs are painted in, over `color`', () => {
		mountCanvas( [
			{
				...text( 'fill', { color: 'rgb(0, 0, 0)', fontSize: '16px' } ),
				textComputed: { webkitTextFillColor: 'rgb(255, 255, 255)' },
			},
		] );

		expect( notesOf( [ 'fill' ] ) ).toEqual( [
			'Text contrast too low: paragraph (fill) — #FFFFFF text on #FFFFFF, 1:1 (needs 4.5:1). The #FFFFFF comes from the page background.',
		] );
	} );

	it( 'leaves a colour it cannot read to the picture', () => {
		mountCanvas( [ { ...text( 'ueo8' ), textComputed: { color: 'oklch(0.5 0.1 200)' } } ] );

		expect( notesOf( [ 'ueo8' ] ) ).toEqual( [ UNMEASURED_ONE ] );
	} );
} );

describe( 'what counts as text', () => {
	it( 'skips text hidden from sight for screen readers, as a social link’s label is', () => {
		mountCanvas( [
			{
				...text( 'fb', GREY_TEXT ),
				name: 'core/social-link',
				textComputed: { position: 'absolute', clipPath: 'inset(50%)' },
			},
		] );

		expect( notesOf( [ 'fb' ] ) ).toEqual( [] );
	} );

	it( 'skips the editor’s own interface inside a block', () => {
		mountCanvas( [
			{
				clientId: 'img',
				name: 'core/image',
				build: ( element, canvasDocument ) => {
					const placeholder = canvasDocument.createElement( 'div' );
					placeholder.className = 'components-placeholder';
					placeholder.style.color = GREY_TEXT.color;
					placeholder.append( 'Upload' );
					element.append( placeholder );
				},
			},
		] );

		expect( notesOf( [ 'img' ] ) ).toEqual( [] );
	} );

	it( 'skips hidden text in a block and measures the visible text', () => {
		mountCanvas( [
			{
				clientId: 'c25n',
				name: 'core/group',
				style: { backgroundColor: NAVY },
				children: [
					{
						...text( 'btn', WHITE_TEXT ),
						build: ( element, canvasDocument ) => {
							const hidden = canvasDocument.createElement( 'span' );
							Object.assign( hidden.style, { ...NAVY_TEXT, visibility: 'hidden' } );
							hidden.append( 'Hidden' );
							element.append( hidden );
						},
					},
				],
			},
		] );

		expect( notesOf( [ 'c25n' ] ) ).toEqual( [
			'Text contrast: all 1 edited text block(s) measure at least 4.5:1 (3:1 for large text) against what renders behind them.',
		] );
	} );
} );

describe( 'overlays', () => {
	const groupWithBadge = ( badge: Rect ): CanvasBlock => ( {
		clientId: 'c25n',
		name: 'core/group',
		style: { backgroundColor: NAVY },
		build: ( element, canvasDocument ) => {
			const shape = withRect( canvasDocument.createElement( 'div' ), badge );
			Object.assign( shape.style, { position: 'absolute', backgroundColor: 'rgb(255, 0, 0)' } );
			element.append( shape );
		},
		children: [ { ...text( 'qalw' ), textRect: { top: 100, left: 0, width: 400, height: 20 } } ],
	} );

	it( 'still measures text clear of a positioned shape', () => {
		mountCanvas( [ groupWithBadge( { top: 0, left: 900, width: 40, height: 40 } ) ] );

		expect( notesOf( [ 'c25n' ] ) ).toEqual( [
			expect.stringMatching(
				/^Text contrast too low: paragraph \(qalw\) — #14213D text on #1D2630/
			),
		] );
	} );

	it( 'leaves text under a positioned shape to the picture', () => {
		mountCanvas( [ groupWithBadge( { top: 90, left: 0, width: 40, height: 40 } ) ] );

		expect( notesOf( [ 'c25n' ] ) ).toEqual( [ UNMEASURED_ONE ] );
	} );
} );

describe( 'limits', () => {
	it( 'writes at most four failure notes, and counts the failures it leaves out', () => {
		mountCanvas( [
			{
				clientId: 'c25n',
				name: 'core/group',
				style: { backgroundColor: NAVY },
				children: [ 20, 30, 40, 50, 60 ].map( ( grey ) =>
					text( `g${ grey }`, { color: `rgb(${ grey }, ${ grey }, ${ grey })`, fontSize: '16px' } )
				),
			},
		] );

		const notes = notesOf( [ 'c25n' ] );

		expect( notes ).toHaveLength( 5 );
		notes.slice( 0, 4 ).forEach( ( note ) => expect( note ).toMatch( /^Text contrast too low: / ) );
		expect( notes[ 4 ] ).toBe(
			'Text contrast too low for 1 more edited text block(s) not listed above.'
		);
	} );

	it( 'claims no pass for all the text when there was more than it read', () => {
		mountCanvas( [
			section( Array.from( { length: 41 }, ( _, index ) => text( `p${ index }` ) ) ),
		] );

		expect( notesOf( [ 'sect' ] ) ).toEqual( [] );
	} );

	it( 'claims no pass for all the text when the walk stopped short of some blocks', () => {
		const spacers = Array.from( { length: 300 }, ( _, index ) => ( {
			clientId: `s${ index }`,
			name: 'core/spacer',
		} ) );

		mountCanvas( [ section( [ text( 'first' ), ...spacers, text( 'last' ) ] ) ] );

		expect( notesOf( [ 'sect' ] ) ).toEqual( [] );
	} );

	it( 'says the counts are of the page’s text when measuring the whole page', () => {
		mountCanvas( [
			section( [
				text( 'ueo8' ),
				{
					clientId: 'faded',
					name: 'core/group',
					style: { opacity: '0.5' },
					children: [ text( 'qalw' ) ],
				},
			] ),
		] );

		expect( describeTextContrast( [ 'sect' ], { wholePage: true } )?.notes ).toEqual( [
			'Text contrast: all 1 text block(s) on the page measure at least 4.5:1 (3:1 for large text) against what renders behind them.',
			'Contrast could not be measured for 1 text block(s) on the page, whose text sits over an image or gradient or uses a colour that cannot be read; judge those from the picture.',
		] );
	} );

	it( 'says the left-out failures are on the page when measuring the whole page', () => {
		mountCanvas( [
			{
				clientId: 'c25n',
				name: 'core/group',
				style: { backgroundColor: NAVY },
				children: [ 20, 30, 40, 50, 60 ].map( ( grey ) =>
					text( `g${ grey }`, { color: `rgb(${ grey }, ${ grey }, ${ grey })`, fontSize: '16px' } )
				),
			},
		] );

		expect( describeTextContrast( [ 'c25n' ], { wholePage: true } )?.notes[ 4 ] ).toBe(
			'Text contrast too low for 1 more text block(s) on the page not listed above.'
		);
	} );

	it( 'notes what passed and what it could not measure together', () => {
		mountCanvas( [
			section( [
				text( 'ueo8' ),
				{
					clientId: 'faded',
					name: 'core/group',
					style: { opacity: '0.5' },
					children: [ text( 'qalw' ) ],
				},
			] ),
		] );

		expect( notesOf( [ 'sect' ] ) ).toEqual( [
			'Text contrast: all 1 edited text block(s) measure at least 4.5:1 (3:1 for large text) against what renders behind them.',
			UNMEASURED_ONE,
		] );
	} );
} );

describe( 'every run of text in a block', () => {
	/** A paragraph of runs in the given styles, in order, as the editor renders inline formats. */
	const formatted = ( clientId: string, runs: { tag: string; style: Styles }[] ): CanvasBlock => ( {
		clientId,
		name: 'core/paragraph',
		build: ( element, canvasDocument ) =>
			runs.forEach( ( { tag, style }, index ) => {
				const run = canvasDocument.createElement( tag );
				Object.assign( run.style, style );
				run.append( `Run ${ index } ` );
				element.append( run );
			} ),
	} );

	it( 'fails a paragraph whose white link sits on white after readable text', () => {
		mountCanvas( [
			formatted( 'mix', [
				{ tag: 'span', style: { color: 'rgb(0, 0, 0)', fontSize: '16px' } },
				{ tag: 'a', style: WHITE_TEXT },
			] ),
		] );

		expect( describeTextContrast( [ 'mix' ] ) ).toEqual( {
			notes: [
				'Text contrast too low: paragraph (mix) — #FFFFFF text on #FFFFFF, 1:1 (needs 4.5:1). The #FFFFFF comes from the page background.',
			],
			failures: 1,
			backdrops: [],
		} );
	} );

	it( 'counts a block once, by its worst run, however many runs fail', () => {
		mountCanvas( [
			formatted( 'mix', [
				{ tag: 'span', style: GREY_TEXT },
				{ tag: 'a', style: WHITE_TEXT },
			] ),
		] );

		expect( describeTextContrast( [ 'mix' ] ) ).toEqual( {
			notes: [
				expect.stringMatching( /^Text contrast too low: paragraph \(mix\) — #FFFFFF text/ ),
			],
			failures: 1,
			backdrops: [],
		} );
	} );

	it( 'claims no pass for a block with a run it could not read', () => {
		mountCanvas( [
			formatted( 'mix', [
				{ tag: 'span', style: { color: 'rgb(0, 0, 0)', fontSize: '16px' } },
				{ tag: 'mark', style: { ...NAVY_TEXT, opacity: '0.5' } },
			] ),
		] );

		expect( describeTextContrast( [ 'mix' ] ) ).toEqual( {
			notes: [ UNMEASURED_ONE ],
			failures: null,
			backdrops: [],
		} );
	} );
} );

describe( 'text a block holds besides its children', () => {
	const BLACK_TEXT = { color: 'rgb(0, 0, 0)', fontSize: '16px' };

	it( 'fails a details block whose summary is unreadable, though its paragraphs read well', () => {
		mountCanvas( [
			{
				clientId: 'det',
				name: 'core/details',
				build: ( element, canvasDocument ) => {
					const summary = canvasDocument.createElement( 'summary' );
					Object.assign( summary.style, WHITE_TEXT );
					summary.append( 'More about us' );
					element.append( summary );
				},
				children: [ text( 'p1', BLACK_TEXT ), text( 'p2', BLACK_TEXT ) ],
			},
		] );

		expect( describeTextContrast( [ 'det' ] ) ).toEqual( {
			notes: [
				'Text contrast too low: details (det) — #FFFFFF text on #FFFFFF, 1:1 (needs 4.5:1). The #FFFFFF comes from the page background.',
			],
			failures: 1,
			backdrops: [],
		} );
	} );

	it( 'measures a list item’s own text apart from its nested list, counting each block once', () => {
		mountCanvas( [
			{
				...text( 'li1', BLACK_TEXT ),
				name: 'core/list-item',
				children: [
					{
						clientId: 'ul2',
						name: 'core/list',
						children: [ { ...text( 'li2', WHITE_TEXT ), name: 'core/list-item' } ],
					},
				],
			},
		] );

		expect( describeTextContrast( [ 'li1' ] ) ).toEqual( {
			notes: [
				'Text contrast too low: list-item (li2) — #FFFFFF text on #FFFFFF, 1:1 (needs 4.5:1). The #FFFFFF comes from the page background.',
			],
			failures: 1,
			backdrops: [],
		} );
	} );
} );

describe( 'the backdrops to fix, for the server', () => {
	const themeGroup = ( clientId: string, children: CanvasBlock[] ): CanvasBlock => ( {
		clientId,
		name: 'core/group',
		style: { backgroundColor: NAVY },
		children,
	} );

	const ownButton = ( clientId: string ): CanvasBlock => ( {
		...text( clientId, WHITE_TEXT ),
		name: 'core/button',
		attributes: { backgroundColor: 'terracotta' },
		style: { backgroundColor: 'rgb(201, 111, 74)' },
	} );

	it( 'lists every failing backdrop, worst first, though the notes are cut short', () => {
		const groups = [ 'g1', 'g2', 'g3', 'g4', 'g5' ];

		mountCanvas( [
			...groups.map( ( id ) => themeGroup( id, [ text( `t${ id }` ) ] ) ),
			ownButton( 'b1' ),
			ownButton( 'b2' ),
			ownButton( 'b3' ),
		] );

		const contrast = describeTextContrast( [ ...groups, 'b1', 'b2', 'b3' ] );

		expect( contrast?.notes ).toContain(
			'Text contrast too low for 4 more edited text block(s) not listed above.'
		);
		expect( contrast?.backdrops.map( ( row ) => row.clientId ) ).toEqual( [
			...groups,
			'b1',
			'b2',
			'b3',
		] );
		expect( contrast?.backdrops[ 0 ] ).toEqual( {
			clientId: 'g1',
			name: 'core/group',
			ownBackground: false,
			textClientIds: [ 'tg1' ],
			readableText: '#FFFFFF',
		} );
		expect( contrast?.backdrops.slice( 5 ) ).toEqual(
			[ 'b1', 'b2', 'b3' ].map( ( id ) => ( {
				clientId: id,
				name: 'core/button',
				ownBackground: true,
				textClientIds: [ id ],
				readableText: '#000000',
			} ) )
		);
	} );

	it( 'lists at most twelve backdrops, and twelve text blocks over each', () => {
		const groups = Array.from( { length: 13 }, ( _, index ) => `g${ index }` );
		const crowded = Array.from( { length: 13 }, ( _, index ) => text( `c${ index }` ) );

		mountCanvas( [
			themeGroup( 'crowd', crowded ),
			...groups.map( ( id ) => themeGroup( id, [ text( `t${ id }` ) ] ) ),
		] );

		const backdrops = describeTextContrast( [ 'crowd', ...groups ] )?.backdrops ?? [];

		expect( backdrops ).toHaveLength( 12 );
		expect( backdrops[ 0 ].clientId ).toBe( 'crowd' );
		expect( backdrops[ 0 ].textClientIds ).toEqual(
			crowded.slice( 0, 12 ).map( ( block ) => block.clientId )
		);
	} );

	it( 'offers black before white when both read, as on mid grey', () => {
		// On any opaque backdrop black or white reaches 4.5:1; on this grey both do.
		mountCanvas( [
			{
				clientId: 'grey',
				name: 'core/group',
				style: { backgroundColor: 'rgb(118, 118, 118)' },
				children: [ text( 'p1', { color: 'rgb(130, 130, 130)', fontSize: '16px' } ) ],
			},
		] );

		expect( describeTextContrast( [ 'grey' ] )?.backdrops ).toEqual( [
			expect.objectContaining( { clientId: 'grey', readableText: '#000000' } ),
		] );
	} );

	it.each( [
		[ 'large text only', [ '32px' ], '#000000' ],
		[ 'small text too', [ '32px', '16px' ], '#FFFFFF' ],
	] )(
		'holds the readable colour to the strictest threshold on it, with %s',
		( _, sizes, readableText ) => {
			// Black on rgb(90, 90, 90) is 3.04:1: enough for large text, not for small.
			mountCanvas( [
				{
					clientId: 'dark',
					name: 'core/group',
					style: { backgroundColor: 'rgb(90, 90, 90)' },
					children: sizes.map( ( fontSize, index ) =>
						text( `t${ index }`, { color: 'rgb(60, 60, 60)', fontSize } )
					),
				},
			] );

			expect( describeTextContrast( [ 'dark' ] )?.backdrops[ 0 ]?.readableText ).toBe(
				readableText
			);
		}
	);

	it( 'never names a block by its long id', () => {
		mountCanvas( [
			themeGroup( 'long-g', [ text( 'p1' ) ] ),
			themeGroup( 'g2', [ text( 'long-p' ), text( 'p2' ) ] ),
		] );

		expect( describeTextContrast( [ 'long-g', 'g2' ] )?.backdrops ).toEqual( [
			{
				clientId: 'g2',
				name: 'core/group',
				ownBackground: false,
				textClientIds: [ 'p2' ],
				readableText: '#FFFFFF',
			},
		] );
	} );
} );

describe( 'blocks with more runs than are read', () => {
	it( 'leaves the unread block to the picture beside the pass for the rest', () => {
		// The block past the run limit is counted as unmeasured, so the pass
		// note covers only what was read, and the next note says so.
		mountCanvas( [
			section( [
				text( 'ueo8' ),
				{
					clientId: 'long',
					name: 'core/paragraph',
					build: ( element, canvasDocument ) => {
						for ( let index = 0; index < 21; index++ ) {
							const run = canvasDocument.createElement( 'span' );
							Object.assign( run.style, NAVY_TEXT );
							run.append( `Run ${ index } ` );
							element.append( run );
						}
					},
				},
			] ),
		] );

		expect( describeTextContrast( [ 'sect' ] ) ).toEqual( {
			notes: [
				'Text contrast: all 1 edited text block(s) measure at least 4.5:1 (3:1 for large text) against what renders behind them.',
				UNMEASURED_ONE,
			],
			failures: 0,
			backdrops: [],
		} );
	} );
} );

describe( 'a block failing against more than one backdrop', () => {
	it( 'lists every backdrop it fails against, and counts the block once', () => {
		// Grey body text fails on the group's white, and black text fails on the
		// paragraph's own black highlight: both are a fix.
		mountCanvas( [
			{
				clientId: 'grp',
				name: 'core/group',
				style: { backgroundColor: 'rgb(255, 255, 255)' },
				children: [
					{
						clientId: 'para',
						name: 'core/paragraph',
						build: ( element, canvasDocument ) => {
							const body = canvasDocument.createElement( 'span' );
							Object.assign( body.style, GREY_TEXT );
							body.append( 'Body ' );

							const highlight = canvasDocument.createElement( 'mark' );
							Object.assign( highlight.style, {
								color: 'rgb(0, 0, 0)',
								backgroundColor: 'rgb(0, 0, 0)',
								fontSize: '16px',
							} );
							highlight.append( 'Highlight' );

							element.append( body, highlight );
						},
					},
				],
			},
		] );

		const contrast = describeTextContrast( [ 'grp' ] );

		expect( contrast?.failures ).toBe( 1 );
		expect( contrast?.notes ).toHaveLength( 1 );
		expect( contrast?.backdrops ).toEqual( [
			{
				clientId: 'para',
				name: 'core/paragraph',
				ownBackground: false,
				textClientIds: [ 'para' ],
				readableText: '#FFFFFF',
			},
			{
				clientId: 'grp',
				name: 'core/group',
				ownBackground: false,
				textClientIds: [ 'para' ],
				readableText: '#000000',
			},
		] );
	} );
} );

describe( 'text outside the box of the background behind it', () => {
	// A dark group with white text, which reads well over the group and not at
	// all over the white page below it.
	const groupWithText = ( textRect: Rect ): CanvasBlock => ( {
		clientId: 'c25n',
		name: 'core/group',
		style: { backgroundColor: NAVY },
		rect: { top: 0, left: 0, width: 400, height: 100 },
		children: [ { ...text( 'qalw', WHITE_TEXT ), textRect } ],
	} );

	it( 'leaves text positioned outside its group’s box to the picture', () => {
		mountCanvas( [ groupWithText( { top: 150, left: 0, width: 200, height: 20 } ) ] );

		expect( describeTextContrast( [ 'c25n' ] ) ).toEqual( {
			notes: [ UNMEASURED_ONE ],
			failures: null,
			backdrops: [],
		} );
	} );

	it( 'measures text against the page background, whatever the body’s box', () => {
		// The body's background fills the canvas, past its own box.
		mountCanvas( [
			{ ...text( 'qalw', WHITE_TEXT ), textRect: { top: 500, left: 0, width: 200, height: 20 } },
		] );

		const body = ( document.querySelector( 'iframe' ) as HTMLIFrameElement ).contentDocument
			?.body as HTMLElement;
		body.style.backgroundColor = NAVY;
		withRect( body, { top: 0, left: 0, width: 400, height: 100 } );

		expect( describeTextContrast( [ 'qalw' ] )?.failures ).toBe( 0 );
	} );

	it( 'measures text inside its group’s box against the group', () => {
		mountCanvas( [ groupWithText( { top: 40, left: 10, width: 200, height: 20 } ) ] );

		expect( describeTextContrast( [ 'c25n' ] )?.failures ).toBe( 0 );
	} );
} );

describe( 'text over a cover image', () => {
	const PHOTO = 'https://example.com/food.jpg';
	const COVER_RECT = { top: 0, left: 0, width: 1200, height: 600 };

	/** Kept pixels, as the capture leaves them: one grey per column, left to right. */
	const photo = ( greys: number[], { tainted = false, alpha = 255 } = {} ) =>
		( {
			width: greys.length,
			height: greys.length / 2,
			getContext: () => ( {
				getImageData: ( x: number, y: number, width: number, rows: number ) => {
					if ( tainted ) {
						throw new DOMException( 'The canvas has been tainted', 'SecurityError' );
					}

					return {
						data: Uint8ClampedArray.from(
							Array.from( { length: rows }, () =>
								greys.slice( x, x + width ).flatMap( ( grey ) => [ grey, grey, grey, alpha ] )
							).flat()
						),
					};
				},
			} ),
		} ) as unknown as HTMLCanvasElement;

	// From darker to lighter, so the 10th and 90th percentiles are 71 and 167.
	const MID_TONED = Array.from( { length: 120 }, ( _, index ) => 60 + index );

	// A line of text across the cover, which jsdom does not lay out.
	const TEXT_RECT = { top: 100, left: 0, width: 1200, height: 40 };
	const boxed = ( block: CanvasBlock ): CanvasBlock => ( { textRect: TEXT_RECT, ...block } );

	const getCanvasImage = () =>
		( document.querySelector( 'iframe' ) as HTMLIFrameElement ).contentDocument?.querySelector(
			'img'
		) as HTMLImageElement;

	/** Computed styles jsdom does not compute, such as a gradient, on one element. */
	const withComputedStyle = < T extends Element >( element: T, styles: Styles ): T => {
		const getComputedStyle = element.ownerDocument.defaultView?.getComputedStyle as jest.Mock;
		const computed = getComputedStyle.getMockImplementation();

		getComputedStyle.mockImplementation( ( target: Element, pseudo?: string ) => {
			const style = computed?.( target, pseudo );

			if ( target === element ) {
				Object.entries( styles ).forEach( ( [ property, value ] ) =>
					Object.defineProperty( style, property, { value } )
				);
			}

			return style;
		} );

		return element;
	};

	const withImageStyle = ( styles: Styles ) => withComputedStyle( getCanvasImage(), styles );

	const getOverlay = () =>
		( document.querySelector( 'iframe' ) as HTMLIFrameElement ).contentDocument?.querySelector(
			'.wp-block-cover__background'
		) as HTMLElement;

	interface CoverOptions {
		overlay?: Styles;
		overlayClass?: string;
		pixels?: HTMLCanvasElement;
		children: CanvasBlock[];
	}

	const cover = ( {
		overlay,
		overlayClass = '',
		pixels,
		children,
	}: CoverOptions ): CanvasBlock => ( {
		clientId: 'hero',
		name: 'core/cover',
		rect: COVER_RECT,
		build: ( element, canvasDocument ) => {
			element.classList.add( 'wp-block-cover' );

			const image = withRect( canvasDocument.createElement( 'img' ), COVER_RECT );
			image.className = 'wp-block-cover__image-background';
			image.src = PHOTO;
			image.style.position = 'absolute';
			element.append( image );

			if ( pixels ) {
				rememberImagePixels( image, PHOTO, pixels );
			}

			if ( overlay ) {
				const span = canvasDocument.createElement( 'span' );
				span.className = `wp-block-cover__background ${ overlayClass }`;
				Object.assign( span.style, { position: 'absolute', ...overlay } );
				withRect( span, COVER_RECT );
				element.append( span );
			}
		},
		children: children.map( boxed ),
	} );

	// WPAGENT-224: `customOverlayColor: #1a1510` at `dimRatio: 55`.
	const HERO_OVERLAY = { backgroundColor: 'rgb(26, 21, 16)', opacity: '0.55' };
	const DARK_INK = { color: 'rgb(37, 45, 36)', fontSize: '16px' };

	it( 'fails the WPAGENT-224 hero’s muted and dark text, and names the cover to fix', () => {
		mountCanvas( [
			cover( {
				overlay: HERO_OVERLAY,
				pixels: photo( MID_TONED ),
				children: [
					{
						...text( 'loca', { color: 'rgb(98, 100, 89)', fontSize: '16px' } ),
						name: 'core/paragraph',
					},
					{ ...text( 'head', { ...DARK_INK, fontSize: '48px' } ), name: 'core/heading' },
					text( 'lead', DARK_INK ),
					{ ...text( 'cta', DARK_INK ), name: 'core/button' },
					text( 'ok', { color: 'rgb(250, 247, 240)', fontSize: '16px' } ),
				],
			} ),
		] );

		const contrast = describeTextContrast( [ 'hero' ] );

		expect( contrast?.failures ).toBe( 4 );
		expect( contrast?.backdrops ).toEqual( [
			{
				clientId: 'hero',
				name: 'core/cover',
				ownBackground: true,
				textClientIds: expect.arrayContaining( [ 'loca', 'head', 'lead', 'cta' ] ),
				readableText: '#FFFFFF',
			},
		] );
		expect( contrast?.backdrops[ 0 ].textClientIds ).not.toContain( 'ok' );
		expect( contrast?.notes.join( ' ' ) ).toContain(
			'comes from cover (hero): its overlay, #1A1510 at 55% opacity, blended over the photograph behind the text.'
		);
		expect( contrast?.notes.join( ' ' ) ).not.toContain( 'could not be measured' );
	} );

	it( 'passes light text on the hero, counting it with the rest that was measured', () => {
		mountCanvas( [
			cover( {
				overlay: HERO_OVERLAY,
				pixels: photo( MID_TONED ),
				children: [ text( 'ok', { color: 'rgb(250, 247, 240)', fontSize: '16px' } ) ],
			} ),
		] );

		expect( describeTextContrast( [ 'hero' ] ) ).toEqual( {
			notes: [
				'Text contrast: all 1 edited text block(s) measure at least 4.5:1 (3:1 for large text) against what renders behind them.',
			],
			failures: 0,
			backdrops: [],
		} );
	} );

	it( 'measures a button with a background of its own against that background, not the cover', () => {
		mountCanvas( [
			cover( {
				overlay: HERO_OVERLAY,
				pixels: photo( MID_TONED ),
				children: [
					{
						...text( 'btn', { ...WHITE_TEXT, backgroundColor: 'rgb(151, 71, 47)' } ),
						name: 'core/button',
					},
				],
			} ),
		] );

		expect( describeTextContrast( [ 'hero' ] )?.failures ).toBe( 0 );
	} );

	it( 'fails white text on a light photo under a light overlay, against the lighter part of it', () => {
		mountCanvas( [
			cover( {
				overlay: { backgroundColor: 'rgb(255, 255, 255)', opacity: '0.2' },
				pixels: photo( Array.from( { length: 20 }, ( _, index ) => 220 + index ) ),
				children: [ text( 'line', WHITE_TEXT ) ],
			} ),
		] );

		const contrast = describeTextContrast( [ 'hero' ] );

		// 0.2 × 255 + 0.8 × 237, the 90th percentile, is 240.6.
		expect( contrast?.notes[ 0 ] ).toMatch(
			/^Text contrast too low: paragraph \(line\) — #FFFFFF text on #F1F1F1/
		);
		expect( contrast?.failures ).toBe( 1 );
		expect( contrast?.backdrops ).toEqual( [
			{
				clientId: 'hero',
				name: 'core/cover',
				ownBackground: true,
				textClientIds: [ 'line' ],
				readableText: '#000000',
			},
		] );
	} );

	it( 'offers a palette colour when neither black nor white reads on both parts of the photo', () => {
		jest.mocked( getPaletteColors ).mockReturnValue( [ 'var(--x)', '#707070' ] );
		mountCanvas( [
			cover( {
				overlay: { backgroundColor: 'rgb(0, 0, 0)', opacity: '0' },
				pixels: photo( [ ...Array( 10 ).fill( 20 ), ...Array( 10 ).fill( 203 ) ] ),
				children: [ text( 'title', { ...WHITE_TEXT, fontSize: '32px' } ) ],
			} ),
		] );

		expect( describeTextContrast( [ 'hero' ] )?.backdrops[ 0 ].readableText ).toBe( '#707070' );
	} );

	// The WPAGENT sandbox hero: a linear gradient over the overlay colour.
	it( 'measures text against a gradient overlay where each part of the text sits', () => {
		mountCanvas( [
			cover( {
				overlay: { backgroundColor: 'rgba(0, 0, 0, 0)', opacity: '1' },
				overlayClass: 'wp-block-cover__gradient-background has-background-gradient',
				pixels: photo( Array( 120 ).fill( 230 ) ),
				children: [
					{
						...text( 'left', WHITE_TEXT ),
						textRect: { top: 100, left: 0, width: 200, height: 40 },
					},
					{
						...text( 'right', WHITE_TEXT ),
						textRect: { top: 200, left: 1000, width: 200, height: 40 },
					},
				],
			} ),
		] );
		// Black at the left edge, clear at the right, over a light photograph.
		withComputedStyle( getOverlay(), {
			backgroundImage: 'linear-gradient(to right, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 0) 100%)',
		} );

		const contrast = describeTextContrast( [ 'hero' ] );

		expect( contrast?.failures ).toBe( 1 );
		expect( contrast?.backdrops ).toEqual( [
			{
				clientId: 'hero',
				name: 'core/cover',
				ownBackground: true,
				textClientIds: [ 'right' ],
				readableText: '#000000',
			},
		] );
		expect( contrast?.notes[ 0 ] ).toContain(
			'comes from cover (hero): its gradient overlay, at 100% opacity, blended over the photograph behind the text.'
		);
	} );

	it( 'leaves text over a gradient overlay it cannot work out to the picture', () => {
		mountCanvas( [
			cover( {
				overlay: HERO_OVERLAY,
				pixels: photo( MID_TONED ),
				children: [ text( 'line', DARK_INK ) ],
			} ),
		] );
		withComputedStyle( getOverlay(), {
			backgroundImage: 'radial-gradient(circle, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 0) 100%)',
		} );

		expect( describeTextContrast( [ 'hero' ] ) ).toEqual( {
			notes: [
				skippedOver(
					'paragraph (line)',
					'its overlay is a gradient that cannot be worked out, such as a radial one'
				),
			],
			failures: null,
			backdrops: [],
		} );
	} );

	it( 'leaves text over a photo whose canvas is tainted to the picture', () => {
		mountCanvas( [
			cover( {
				overlay: HERO_OVERLAY,
				pixels: photo( MID_TONED, { tainted: true } ),
				children: [ text( 'line', DARK_INK ) ],
			} ),
		] );

		expect( notesOf( [ 'hero' ] ) ).toEqual( [ skippedOver( 'paragraph (line)', UNREADABLE ) ] );
	} );

	it( 'leaves text over a photo that has not loaded to the picture', () => {
		mountCanvas( [ cover( { overlay: HERO_OVERLAY, children: [ text( 'line', DARK_INK ) ] } ) ] );

		expect( notesOf( [ 'hero' ] ) ).toEqual( [ skippedOver( 'paragraph (line)', UNREADABLE ) ] );
	} );

	// Reading the whole image instead is no safe stand-in: a bright band
	// behind the text barely moves a mostly dark photograph's percentiles.
	it( 'leaves text with no box of its own over the photo to the picture', () => {
		mountCanvas( [
			cover( {
				overlay: HERO_OVERLAY,
				pixels: photo( MID_TONED ),
				children: [
					{ ...text( 'line', DARK_INK ), textRect: { top: 0, left: 0, width: 0, height: 0 } },
				],
			} ),
		] );

		expect( notesOf( [ 'hero' ] ) ).toEqual( [ skippedOver( 'paragraph (line)', PLACEMENT ) ] );
	} );

	it( 'leaves text over a photo the measurement cannot map to the picture', () => {
		mountCanvas( [
			cover( {
				overlay: HERO_OVERLAY,
				pixels: photo( MID_TONED ),
				children: [ text( 'line', DARK_INK ) ],
			} ),
		] );
		withImageStyle( { objectFit: 'none' } );

		expect( notesOf( [ 'hero' ] ) ).toEqual( [ skippedOver( 'paragraph (line)', PLACEMENT ) ] );
	} );

	// Centring it instead would read the wrong part of the photograph.
	it( 'leaves text over a photo placed where the measurement cannot work out to the picture', () => {
		mountCanvas( [
			cover( {
				overlay: HERO_OVERLAY,
				pixels: photo( MID_TONED ),
				children: [ text( 'line', DARK_INK ) ],
			} ),
		] );
		withImageStyle( { objectPosition: '2em 50%' } );

		expect( notesOf( [ 'hero' ] ) ).toEqual( [ skippedOver( 'paragraph (line)', PLACEMENT ) ] );
	} );

	it( 'measures text over a photo placed at a plain position', () => {
		mountCanvas( [
			cover( {
				overlay: HERO_OVERLAY,
				pixels: photo( MID_TONED ),
				children: [ text( 'line', DARK_INK ) ],
			} ),
		] );
		withImageStyle( { objectPosition: '30% 70%' } );

		expect( describeTextContrast( [ 'hero' ] )?.failures ).toBe( 1 );
	} );

	// Over the letterbox, the text sits on whatever is behind the image.
	it( 'leaves text running past a contained photo to the picture', () => {
		mountCanvas( [
			cover( {
				overlay: HERO_OVERLAY,
				pixels: photo( MID_TONED ),
				children: [ text( 'line', DARK_INK ) ],
			} ),
		] );
		const image = withImageStyle( { objectFit: 'contain' } );

		// The 2:1 photograph starts 120px down its 840px box, so the line of
		// text at 100–140px is half over the letterbox.
		image.getBoundingClientRect = () =>
			( { top: 0, left: 0, width: 1200, height: 840, right: 1200, bottom: 840 } ) as DOMRect;

		expect( notesOf( [ 'hero' ] ) ).toEqual( [ skippedOver( 'paragraph (line)', PLACEMENT ) ] );
	} );

	// What shows through is the cover's background or the page behind it.
	it( 'leaves text over a transparent part of the photo to the picture', () => {
		mountCanvas( [
			cover( {
				overlay: HERO_OVERLAY,
				pixels: photo( MID_TONED, { alpha: 0 } ),
				children: [ text( 'line', DARK_INK ) ],
			} ),
		] );

		expect( notesOf( [ 'hero' ] ) ).toEqual( [
			skippedOver( 'paragraph (line)', 'its photograph is transparent behind the text' ),
		] );
	} );

	it( 'measures text on an opaque overlay, which hides the image', () => {
		mountCanvas( [
			cover( {
				overlay: { backgroundColor: 'rgb(26, 21, 16)', opacity: '1' },
				children: [ text( 'line', DARK_INK ) ],
			} ),
		] );

		const contrast = describeTextContrast( [ 'hero' ] );

		expect( contrast?.failures ).toBe( 1 );
		expect( contrast?.notes[ 0 ] ).toContain( '#252D24 text on #1A1510' );
		expect( contrast?.notes[ 0 ] ).toContain( 'overlay, which hides its image' );
	} );
} );

describe( 'text over a cover image, read more than once or more than one way', () => {
	const PHOTO = 'https://example.com/food.jpg';
	const COVER_RECT = { top: 0, left: 0, width: 1200, height: 600 };
	const DARK_INK = { color: 'rgb(37, 45, 36)', fontSize: '16px' };
	const TEXT_RECT = { top: 100, left: 0, width: 1200, height: 40 };
	const greys = Array.from( { length: 120 }, ( _, index ) => 60 + index );
	const imageData = ( x: number, y: number, width: number, rows: number ) => ( {
		data: Uint8ClampedArray.from(
			Array.from( { length: rows }, () =>
				greys.slice( x, x + width ).flatMap( ( grey ) => [ grey, grey, grey, 255 ] )
			).flat()
		),
	} );
	const kept = () =>
		( {
			width: greys.length,
			height: greys.length / 2,
			getContext: () => ( { getImageData: imageData } ),
		} ) as unknown as HTMLCanvasElement;

	const cover = (
		clientId: string,
		children: CanvasBlock[],
		{ overlay = true, pixels = true, imageStyle = {}, loaded = false } = {}
	): CanvasBlock => ( {
		clientId,
		name: 'core/cover',
		rect: COVER_RECT,
		build: ( element, canvasDocument ) => {
			element.classList.add( 'wp-block-cover' );

			const image = withRect( canvasDocument.createElement( 'img' ), COVER_RECT );
			image.className = 'wp-block-cover__image-background';
			image.src = PHOTO;
			Object.assign( image.style, { position: 'absolute', ...imageStyle } );
			element.append( image );

			if ( pixels ) {
				rememberImagePixels( image, PHOTO, kept() );
			}

			if ( loaded ) {
				Object.defineProperties( image, {
					complete: { value: true },
					naturalWidth: { value: greys.length },
					naturalHeight: { value: greys.length / 2 },
				} );
			}

			if ( overlay ) {
				const span = canvasDocument.createElement( 'span' );
				span.className = 'wp-block-cover__background';
				Object.assign( span.style, {
					position: 'absolute',
					backgroundColor: 'rgb(26, 21, 16)',
					opacity: '0.55',
				} );
				element.append( span );
			}
		},
		children: children.map( ( child ) => ( { textRect: TEXT_RECT, ...child } ) ),
	} );

	it( 'gives each of two matching covers its own note, naming its own cover', () => {
		mountCanvas( [
			cover( 'one', [ text( 'a', DARK_INK ) ] ),
			cover( 'two', [ text( 'b', DARK_INK ) ] ),
		] );

		const notes = describeTextContrast( [ 'one', 'two' ] )?.notes ?? [];

		expect( notes ).toHaveLength( 2 );
		expect( notes[ 0 ] ).toMatch( /paragraph \(a\) .* comes from cover \(one\)/ );
		expect( notes[ 1 ] ).toMatch( /paragraph \(b\) .* comes from cover \(two\)/ );
	} );

	it( 'says a cover with no overlay shows its photograph undimmed', () => {
		mountCanvas( [ cover( 'hero', [ text( 'a', DARK_INK ) ], { overlay: false } ) ] );

		const [ note ] = notesOf( [ 'hero' ] );

		expect( note ).toContain(
			'comes from the photograph behind the text in cover (hero), which no overlay dims.'
		);
		expect( note ).not.toContain( 'opacity' );
	} );

	// What a duotone or a fade renders is not in the pixels sampled.
	it.each( [
		[ 'a duotone', { filter: 'url(#wp-duotone-dark)' } ],
		[ 'a fade', { opacity: '0.5' } ],
	] )( 'leaves text over an image with %s to the picture', ( _, imageStyle ) => {
		mountCanvas( [ cover( 'hero', [ text( 'a', DARK_INK ) ], { imageStyle } ) ] );

		expect( notesOf( [ 'hero' ] ) ).toEqual( [
			skippedOver( 'paragraph (a)', 'its image is filtered, faded or blended, as a duotone does' ),
		] );
	} );

	it( 'draws the editor’s own copy of the image once for every run over it', () => {
		mountCanvas( [
			cover( 'hero', [ text( 'a', DARK_INK ), text( 'b', DARK_INK ) ], {
				pixels: false,
				loaded: true,
			} ),
		] );

		const frameWindow = ( document.querySelector( 'iframe' ) as HTMLIFrameElement )
			.contentWindow as Window & typeof globalThis;
		const drawImage = jest.fn();
		const getContext = jest
			.spyOn( frameWindow.HTMLCanvasElement.prototype, 'getContext' )
			.mockReturnValue( {
				drawImage,
				getImageData: imageData,
			} as unknown as CanvasRenderingContext2D );

		try {
			expect( describeTextContrast( [ 'hero' ] )?.failures ).toBe( 2 );
			expect( drawImage ).toHaveBeenCalledTimes( 1 );
		} finally {
			getContext.mockRestore();
		}
	} );
} );
