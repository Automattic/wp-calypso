import {
	ARROW_SIZE,
	MIN_SHEET_WIDTH,
	TOOLBAR_HEIGHT,
	fitSlide,
	placeSlide,
	type PreviewDevice,
	type Size,
} from '../gallery-geometry';

const STAGES = [
	{ width: 1920, height: 773 },
	{ width: 1280, height: 549 },
	{ width: 1280, height: 309 },
	{ width: 640, height: 296 },
	{ width: 390, height: 534 },
	{ width: 390, height: 256 },
];
const DEVICES: PreviewDevice[] = [ 'desktop', 'mobile' ];

const layout = ( stage: Size, device: PreviewDevice ) => {
	const fit = fitSlide( stage, device );
	const slides = [ -1, 0, 1 ].map( ( offset ) => {
		const place = placeSlide( offset, fit );
		const width = fit.width * place.scale;
		const height = fit.height * place.scale;
		const x = stage.width / 2 + place.x;
		const y = stage.height / 2 + place.y;
		return {
			...place,
			left: x - width / 2,
			right: x + width / 2,
			top: y - height / 2,
			bottom: y + height / 2,
		};
	} );
	const sheet = {
		left: ( stage.width - fit.sheetWidth ) / 2,
		right: ( stage.width + fit.sheetWidth ) / 2,
		top: ( stage.height - fit.height - fit.toolbar ) / 2,
	};
	return { fit, slides, sheet };
};

const cases = ( wide: boolean ) =>
	STAGES.filter( ( stage ) => stage.width >= 600 === wide ).flatMap( ( stage ) =>
		DEVICES.map( ( device ) => [ stage, device ] as const )
	);

describe( 'fitSlide and placeSlide', () => {
	it.each( [ ...cases( true ), ...cases( false ) ] )(
		'puts the active design under the toolbar and both neighbors whole beside the sheet on %o (%s)',
		( stage, device ) => {
			const { fit, slides, sheet } = layout( stage, device );
			const [ previous, active, next ] = slides;

			expect( sheet.top ).toBeGreaterThanOrEqual( -0.01 );
			expect( active.top ).toBeCloseTo( sheet.top + TOOLBAR_HEIGHT );
			expect( active.bottom ).toBeLessThanOrEqual( stage.height + 0.01 );
			expect( fit.sheetWidth ).toBeGreaterThanOrEqual( fit.width );
			expect( previous.left ).toBeGreaterThan( 0 );
			expect( next.right ).toBeLessThan( stage.width );
			expect( previous.right ).toBeLessThan( sheet.left );
			expect( sheet.right ).toBeLessThan( next.left );
			expect( previous.top ).toBeGreaterThanOrEqual( sheet.top + TOOLBAR_HEIGHT - 0.01 );
			expect( previous.scale ).toBeLessThan( 1 );
			expect( slides.every( ( slide ) => slide.visible ) ).toBe( true );
		}
	);

	it.each( cases( true ) )(
		'leaves a lane for the buttons at each side of a wide stage %o (%s)',
		( stage, device ) => {
			const [ previous, , next ] = layout( stage, device ).slides;

			expect( previous.left ).toBeGreaterThanOrEqual( 24 + ARROW_SIZE );
			expect( next.right ).toBeLessThanOrEqual( stage.width - 24 - ARROW_SIZE );
		}
	);

	it.each( cases( false ) )(
		'leaves the bottom corners of a narrow stage to the buttons %o (%s)',
		( stage, device ) => {
			const { slides, sheet } = layout( stage, device );

			expect( slides[ 0 ].bottom ).toBeLessThanOrEqual( stage.height - ARROW_SIZE );
			expect( sheet.left ).toBeGreaterThanOrEqual( 8 + ARROW_SIZE );
		}
	);

	it.each( [ ...cases( true ), ...cases( false ) ] )(
		'keeps the toolbar wide enough for its two controls on %o (%s)',
		( stage, device ) => {
			expect( fitSlide( stage, device ).sheetWidth ).toBeGreaterThanOrEqual( MIN_SHEET_WIDTH );
		}
	);

	it( 'keeps the device proportions', () => {
		DEVICES.forEach( ( device ) => {
			const fit = fitSlide( { width: 1280, height: 549 }, device );
			expect( fit.width / fit.height ).toBeCloseTo( device === 'desktop' ? 1280 / 800 : 390 / 844 );
			expect( fit.scale ).toBeCloseTo( fit.width / ( device === 'desktop' ? 1280 : 390 ) );
		} );
	} );

	it( 'gives the active design all the height under the toolbar when the width allows', () => {
		const wide = fitSlide( { width: 1280, height: 549 }, 'desktop' );
		const tall = fitSlide( { width: 1280, height: 549 }, 'mobile' );
		const roomy = fitSlide( { width: 1920, height: 773 }, 'desktop' );

		expect( wide.height ).toBeCloseTo( 549 - TOOLBAR_HEIGHT );
		expect( wide.neighborScale ).toBeGreaterThanOrEqual( 0.15 );
		expect( tall.height ).toBeCloseTo( 549 - TOOLBAR_HEIGHT );
		expect( tall.neighborScale ).toBe( 0.6 );
		expect( roomy.height ).toBeCloseTo( 773 - TOOLBAR_HEIGHT );
	} );

	it( 'widens the sheet, not the phone preview, when the preview is narrower than the toolbar', () => {
		const fit = fitSlide( { width: 390, height: 534 }, 'mobile' );

		expect( fit.height ).toBeCloseTo( 534 - TOOLBAR_HEIGHT );
		expect( fit.width ).toBeLessThan( MIN_SHEET_WIDTH );
		expect( fit.sheetWidth ).toBe( MIN_SHEET_WIDTH );
	} );

	it( 'uses the whole stage for a single design', () => {
		const single = fitSlide( { width: 1280, height: 549 }, 'desktop', false );

		expect( single.height ).toBeCloseTo( 549 - TOOLBAR_HEIGHT );
	} );

	it( 'keeps farther slides off the stage', () => {
		const fit = fitSlide( { width: 1280, height: 549 }, 'desktop' );

		expect( placeSlide( 2, fit ).visible ).toBe( false );
		expect( placeSlide( -3, fit ).visible ).toBe( false );
		expect( placeSlide( 2, fit ).x ).toBeGreaterThan( placeSlide( 1, fit ).x );
	} );

	it( 'has nothing to fit before the stage is measured', () => {
		expect( fitSlide( { width: 0, height: 0 }, 'desktop' ) ).toMatchObject( {
			width: 0,
			height: 0,
		} );
	} );
} );
