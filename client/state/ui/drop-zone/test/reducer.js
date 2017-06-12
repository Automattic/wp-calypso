/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	DROPZONE_SHOW,
	DROPZONE_HIDE,
} from 'state/action-types';

import dropZone from '../reducer';

describe( 'reducer', () => {
	it( 'should show DropZone', () => {
		expect( dropZone( {}, {
			type: DROPZONE_SHOW,
			dropZoneName: 'testZone'
		} ) ).to.be.eql( { isVisible: { testZone: true } } );
	} );

	it( 'should hide DropZone', () => {
		expect( dropZone( { isVisible: { testZone: false } }, {
			type: DROPZONE_HIDE,
			dropZoneName: 'testZone'
		} ) ).to.be.eql( { isVisible: { testZone: false } } );
	} );
} );
