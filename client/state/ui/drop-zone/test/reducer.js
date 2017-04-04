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
			type: DROPZONE_SHOW
		} ) ).to.be.eql( { isVisible: true } );
	} );

	it( 'should hide DropZone', () => {
		expect( dropZone( { isVisible: true }, {
			type: DROPZONE_HIDE,
		} ) ).to.be.eql( { isVisible: false } );
	} );
} );
