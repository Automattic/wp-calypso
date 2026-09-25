/**
 * @jest-environment jsdom
 */

import { bumpStat } from '../analytics';
import { installDomMutationGuard } from '../dom-mutation-guard';

jest.mock( '../analytics', () => ( {
	bumpStat: jest.fn(),
} ) );

const mockedBumpStat = jest.mocked( bumpStat );

installDomMutationGuard();

describe( 'installDomMutationGuard', () => {
	// Must run before any other recovery: the stat is bumped once per page load.
	test( 'bumps a stat once no matter how many recoveries happen', () => {
		const parent = document.createElement( 'div' );
		parent.removeChild( document.createElement( 'span' ) );
		parent.insertBefore( document.createElement( 'em' ), document.createElement( 'span' ) );

		expect( mockedBumpStat ).toHaveBeenCalledTimes( 1 );
		expect( mockedBumpStat ).toHaveBeenCalledWith(
			'calypso_dashboard_dom_mutation_guard',
			'recovered'
		);
	} );

	test( 'removeChild still removes an actual child', () => {
		const parent = document.createElement( 'div' );
		const child = document.createElement( 'span' );
		parent.appendChild( child );

		expect( parent.removeChild( child ) ).toBe( child );
		expect( parent.childNodes ).toHaveLength( 0 );
	} );

	test( 'removeChild no-ops instead of throwing when the child was detached', () => {
		const parent = document.createElement( 'div' );
		const child = document.createElement( 'span' );

		expect( () => parent.removeChild( child ) ).not.toThrow();
		expect( parent.removeChild( child ) ).toBe( child );
	} );

	test( 'insertBefore still inserts before an actual child', () => {
		const parent = document.createElement( 'div' );
		const reference = document.createElement( 'span' );
		const newNode = document.createElement( 'em' );
		parent.appendChild( reference );

		parent.insertBefore( newNode, reference );

		expect( Array.from( parent.childNodes ) ).toEqual( [ newNode, reference ] );
	} );

	test( 'insertBefore appends instead of throwing when the reference node was detached', () => {
		const parent = document.createElement( 'div' );
		const existing = document.createElement( 'span' );
		const detachedReference = document.createElement( 'span' );
		const newNode = document.createElement( 'em' );
		parent.appendChild( existing );

		expect( () => parent.insertBefore( newNode, detachedReference ) ).not.toThrow();
		expect( Array.from( parent.childNodes ) ).toEqual( [ existing, newNode ] );
	} );

	test( 'insertBefore with a null reference still appends', () => {
		const parent = document.createElement( 'div' );
		const newNode = document.createElement( 'em' );

		parent.insertBefore( newNode, null );

		expect( Array.from( parent.childNodes ) ).toEqual( [ newNode ] );
	} );
} );
