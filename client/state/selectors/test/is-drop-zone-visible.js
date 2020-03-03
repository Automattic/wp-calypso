/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import isDropZoneVisible from 'state/selectors/is-drop-zone-visible';

describe( 'isDropZoneVisible()', () => {
	test( 'should return false as a default state', () => {
		expect(
			isDropZoneVisible( {
				ui: {
					dropZone: undefined,
				},
			} )
		).to.be.false;
	} );

	test( 'should return isVisible state', () => {
		expect(
			isDropZoneVisible(
				{
					ui: {
						dropZone: {
							isVisible: {
								myTestZone: 'myTest',
							},
						},
					},
				},
				'myTestZone'
			)
		).to.be.eql( 'myTest' );
	} );
} );
