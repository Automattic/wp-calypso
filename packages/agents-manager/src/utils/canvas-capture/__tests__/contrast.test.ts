jest.mock( '../../block-ids', () => ( {
	createShortIdLookup: () => ( { findShortId: ( clientId: string ) => clientId } ),
} ) );
jest.mock( '../../editor-blocks', () => ( {
	getBlock: jest.fn(),
	getBlocks: jest.fn(),
} ) );

import { getBlock, getBlocks } from '../../editor-blocks';
import { describeTextContrast } from '../contrast';
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

		expect( describeTextContrast( [ 'sect' ] ) ).toEqual( [
			'Text contrast too low: heading (ueo8) and paragraph (qalw) — #14213D text on #1D2630, 1.04:1 (needs 4.5:1). The #1D2630 comes from group (c25n), which sets no background of its own, so the colour comes from the theme or global styles.',
		] );
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

		expect( describeTextContrast( [ 'c25n' ] ) ).toEqual( [
			"Text contrast too low: paragraph (qalw) — #14213D text on #1D2630, 1.04:1 (needs 4.5:1). The #1D2630 comes from group (c25n)'s own background.",
		] );
	} );

	it( 'says when nothing paints the backdrop, and rounds a ratio just short of the threshold down', () => {
		mountCanvas( [ text( 'grey', GREY_TEXT ) ] );

		expect( describeTextContrast( [ 'grey' ] ) ).toEqual( [
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

		expect( describeTextContrast( [ 'sect' ] ) ).toEqual( [
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

		expect( describeTextContrast( [ 'big', 'bold', 'body' ] ) ).toEqual( [
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

		expect( describeTextContrast( [ 'c25n' ] ) ).toEqual( [
			expect.stringContaining(
				'heading (ueo8) and paragraph (qalw) — #14213D text on #1D2630, 1.04:1 (needs 4.5:1).'
			),
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

		const notes = describeTextContrast( [ 'grey', 'c25n' ] );

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

	expect( describeTextContrast( [ 'sect' ] ) ).toEqual( [
		'Text contrast: all 1 edited text block(s) measure at least 4.5:1 (3:1 for large text) against what renders behind them.',
	] );
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

	expect( describeTextContrast( [ 'gone' ] ) ).toEqual( [] );
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

		expect( describeTextContrast( [ 'cover' ] ) ).toEqual( [ UNMEASURED_ONE ] );
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

		expect( describeTextContrast( [ 'cover' ] ) ).toEqual( [ UNMEASURED_ONE ] );
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

		expect( describeTextContrast( [ 'cover' ] ) ).toEqual( [ UNMEASURED_ONE ] );
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

		expect( describeTextContrast( [ 'band' ] ) ).toEqual( [ UNMEASURED_ONE ] );
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

		expect( describeTextContrast( [ 'faded' ] ) ).toEqual( [ UNMEASURED_ONE ] );
	} );

	it( 'leaves a colour it cannot read to the picture', () => {
		mountCanvas( [ { ...text( 'ueo8' ), textComputed: { color: 'oklch(0.5 0.1 200)' } } ] );

		expect( describeTextContrast( [ 'ueo8' ] ) ).toEqual( [ UNMEASURED_ONE ] );
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

		expect( describeTextContrast( [ 'fb' ] ) ).toEqual( [] );
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

		expect( describeTextContrast( [ 'img' ] ) ).toEqual( [] );
	} );

	it( 'measures the first visible text, past text that is hidden', () => {
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

		expect( describeTextContrast( [ 'c25n' ] ) ).toEqual( [
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

		expect( describeTextContrast( [ 'c25n' ] ) ).toEqual( [
			expect.stringMatching(
				/^Text contrast too low: paragraph \(qalw\) — #14213D text on #1D2630/
			),
		] );
	} );

	it( 'leaves text under a positioned shape to the picture', () => {
		mountCanvas( [ groupWithBadge( { top: 90, left: 0, width: 40, height: 40 } ) ] );

		expect( describeTextContrast( [ 'c25n' ] ) ).toEqual( [ UNMEASURED_ONE ] );
	} );
} );

describe( 'limits', () => {
	it( 'writes at most four failure notes', () => {
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

		const notes = describeTextContrast( [ 'c25n' ] );

		expect( notes ).toHaveLength( 4 );
		notes.forEach( ( note ) => expect( note ).toMatch( /^Text contrast too low/ ) );
	} );

	it( 'claims no pass for all the text when there was more than it read', () => {
		mountCanvas( [
			section( Array.from( { length: 41 }, ( _, index ) => text( `p${ index }` ) ) ),
		] );

		expect( describeTextContrast( [ 'sect' ] ) ).toEqual( [] );
	} );

	it( 'claims no pass for all the text when the walk stopped short of some blocks', () => {
		const spacers = Array.from( { length: 300 }, ( _, index ) => ( {
			clientId: `s${ index }`,
			name: 'core/spacer',
		} ) );

		mountCanvas( [ section( [ text( 'first' ), ...spacers, text( 'last' ) ] ) ] );

		expect( describeTextContrast( [ 'sect' ] ) ).toEqual( [] );
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

		expect( describeTextContrast( [ 'sect' ] ) ).toEqual( [
			'Text contrast: all 1 edited text block(s) measure at least 4.5:1 (3:1 for large text) against what renders behind them.',
			UNMEASURED_ONE,
		] );
	} );
} );
