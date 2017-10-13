/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { shouldShowVideoEditorError } from '../';

describe( 'shouldShowVideoEditorError()', () => {
	test( 'should return the poster error state', () => {
		const showError = shouldShowVideoEditorError( {
			ui: {
				editor: {
					videoEditor: {
						showError: true,
					},
				},
			},
		} );

		expect( showError ).to.be.true;
	} );
} );
