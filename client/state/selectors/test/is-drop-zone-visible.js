/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isDropZoneVisible } from '../';

describe( 'isDropZoneVisible()', () => {
	it( 'should return false as a default state', () => {
		expect( isDropZoneVisible( { dropZone: undefined } ) ).to.be.false;
	} );

	it( 'should return isVisible state', () => {
		expect( isDropZoneVisible( {
			dropZone: {
				isVisible: 'myTest'
			}
		} ) ).to.be.eql( 'myTest' );
	} );
} );
