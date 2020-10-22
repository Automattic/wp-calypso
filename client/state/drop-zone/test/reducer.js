/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import dropZone from '../reducer';
import { DROPZONE_SHOW, DROPZONE_HIDE } from 'calypso/state/action-types';

describe( 'reducer', () => {
	test( 'should show DropZone', () => {
		expect(
			dropZone(
				{},
				{
					type: DROPZONE_SHOW,
					dropZoneName: 'testZone',
				}
			)
		).to.be.eql( { isVisible: { testZone: true } } );
	} );

	test( 'should hide DropZone', () => {
		expect(
			dropZone(
				{ isVisible: { testZone: false } },
				{
					type: DROPZONE_HIDE,
					dropZoneName: 'testZone',
				}
			)
		).to.be.eql( { isVisible: { testZone: false } } );
	} );
} );
