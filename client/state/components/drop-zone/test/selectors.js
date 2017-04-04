/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isDropZoneVisible } from '../selectors';

describe( 'selectors', () => {
	it( 'should return false as a default state', () => {
		expect( isDropZoneVisible( { dropZone: undefined } ) ).to.be.false;
	} );

	it( 'should return isVisible state', () => {
		expect( isDropZoneVisible( {
			dropZone: {
				isVisible: 'mytest'
			}
		} ) ).to.be.eql( 'mytest' );
	} );
} );
