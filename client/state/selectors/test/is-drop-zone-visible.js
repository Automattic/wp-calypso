/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import isDropZoneVisible from 'calypso/state/selectors/is-drop-zone-visible';

describe( 'isDropZoneVisible()', () => {
	test( 'should return false as a default state', () => {
		expect(
			isDropZoneVisible( {
				dropZone: undefined,
			} )
		).to.be.false;
	} );

	test( 'should return isVisible state', () => {
		expect(
			isDropZoneVisible(
				{
					dropZone: {
						isVisible: {
							myTestZone: 'myTest',
						},
					},
				},
				'myTestZone'
			)
		).to.be.eql( 'myTest' );
	} );
} );
