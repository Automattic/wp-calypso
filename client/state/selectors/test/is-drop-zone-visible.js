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
		expect( isDropZoneVisible( {
			ui: {
				dropZone: undefined
			}
		} ) ).to.be.false;
	} );

	it( 'should return isVisible state', () => {
		expect( isDropZoneVisible( {
			ui: {
				dropZone: {
					isVisible: {
						myTestZone: 'myTest',
					}
				}
			}
		}, 'myTestZone' ) ).to.be.eql( 'myTest' );
	} );
} );
