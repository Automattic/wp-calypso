/**
 * @jest-environment jsdom
 */
import { getMasterbarElement } from '../index';

function addBar( id: string ) {
	const bar = document.createElement( 'div' );
	bar.id = id;
	document.body.append( bar );
}

describe( 'getMasterbarElement', () => {
	beforeEach( () => {
		document.body.innerHTML = '';
	} );

	it( 'finds the legacy masterbar', () => {
		addBar( 'header' );

		expect( getMasterbarElement()?.id ).toBe( 'header' );
	} );

	it( 'finds the omnibar when it replaces the masterbar', () => {
		addBar( 'wpcom-omnibar' );

		expect( getMasterbarElement()?.id ).toBe( 'wpcom-omnibar' );
	} );

	it( 'prefers the legacy masterbar when both are present', () => {
		addBar( 'header' );
		addBar( 'wpcom-omnibar' );

		expect( getMasterbarElement()?.id ).toBe( 'header' );
	} );

	it( 'returns null when neither is present', () => {
		expect( getMasterbarElement() ).toBeNull();
	} );
} );
