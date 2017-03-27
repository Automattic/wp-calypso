/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { shouldCloseVideoEditorModal } from '../';

describe( 'shouldCloseVideoEditorModal()', () => {
	it( 'should return whether or not the video editor modal should be closed', () => {
		const shouldClose = shouldCloseVideoEditorModal( {
			ui: {
				editor: {
					videoEditor: {
						closeModal: false
					}
				}
			}
		} );

		expect( shouldClose ).to.be.false;
	} );
} );
