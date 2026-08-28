/**
 * @jest-environment jsdom
 */
import scrollTo from 'calypso/lib/scroll-to';
import scrollToAnchor from '../index';

jest.mock( 'calypso/lib/scroll-to', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

const scrollToMock = scrollTo as unknown as jest.Mock;

const MASTERBAR_HEIGHT = 46;
const TARGET_OFFSET_TOP = 1000;
const ANCHOR_OFFSET = 72;

function addMasterbar( id: string ) {
	const bar = document.createElement( 'div' );
	bar.id = id;
	// jsdom performs no layout, so `offsetHeight` is always 0 unless we shadow it.
	Object.defineProperty( bar, 'offsetHeight', { value: MASTERBAR_HEIGHT } );
	document.body.append( bar );
}

function addTarget() {
	const target = document.createElement( 'div' );
	target.id = 'target';
	Object.defineProperty( target, 'offsetTop', { value: TARGET_OFFSET_TOP } );
	document.body.append( target );
}

describe( 'scrollToAnchor', () => {
	beforeEach( () => {
		document.body.innerHTML = '';
		window.location.hash = '';
		scrollToMock.mockClear();
	} );

	it( 'subtracts the height of the legacy masterbar', () => {
		addMasterbar( 'header' );
		addTarget();
		window.location.hash = '#target';

		scrollToAnchor( { offset: ANCHOR_OFFSET } );

		expect( scrollToMock ).toHaveBeenCalledWith( {
			y: TARGET_OFFSET_TOP - MASTERBAR_HEIGHT - ANCHOR_OFFSET,
			container: undefined,
		} );
	} );

	it( 'subtracts the height of the omnibar when it replaces the masterbar', () => {
		addMasterbar( 'wpcom-omnibar' );
		addTarget();
		window.location.hash = '#target';

		scrollToAnchor( { offset: ANCHOR_OFFSET } );

		expect( scrollToMock ).toHaveBeenCalledWith( {
			y: TARGET_OFFSET_TOP - MASTERBAR_HEIGHT - ANCHOR_OFFSET,
			container: undefined,
		} );
	} );

	it( 'prefers the legacy masterbar when both are present', () => {
		addMasterbar( 'header' );

		const omnibar = document.createElement( 'div' );
		omnibar.id = 'wpcom-omnibar';
		Object.defineProperty( omnibar, 'offsetHeight', { value: 200 } );
		document.body.append( omnibar );

		addTarget();
		window.location.hash = '#target';

		scrollToAnchor( { offset: ANCHOR_OFFSET } );

		expect( scrollToMock ).toHaveBeenCalledWith( {
			y: TARGET_OFFSET_TOP - MASTERBAR_HEIGHT - ANCHOR_OFFSET,
			container: undefined,
		} );
	} );

	it( 'subtracts nothing when neither bar is present', () => {
		addTarget();
		window.location.hash = '#target';

		scrollToAnchor( { offset: ANCHOR_OFFSET } );

		expect( scrollToMock ).toHaveBeenCalledWith( {
			y: TARGET_OFFSET_TOP - ANCHOR_OFFSET,
			container: undefined,
		} );
	} );

	it( 'does not scroll when the hash matches no element', () => {
		addMasterbar( 'wpcom-omnibar' );
		addTarget();
		window.location.hash = '#missing';

		scrollToAnchor( { offset: ANCHOR_OFFSET } );

		expect( scrollToMock ).not.toHaveBeenCalled();
	} );

	it( 'does not scroll when there is no hash', () => {
		addMasterbar( 'wpcom-omnibar' );
		addTarget();

		scrollToAnchor( { offset: ANCHOR_OFFSET } );

		expect( scrollToMock ).not.toHaveBeenCalled();
	} );
} );
