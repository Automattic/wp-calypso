/**
 * Internal dependencies
 */
import { gutenframeUpdateImageBlocks as gutenframeUpdateImageBlocksThunk } from 'calypso/state/media/thunks/gutenframe-update-image-blocks';

describe( 'media - thunks - gutenframeUpdateImageBlocks', () => {
	const dispatch = jest.fn();
	const getState = jest.fn();

	const gutenframeUpdateImageBlocks = ( ...args ) =>
		gutenframeUpdateImageBlocksThunk( ...args )( dispatch, getState );

	test( "shouldn't do anything at all if the iframe editor isn't loaded", () => {
		const postMessage = jest.fn();
		getState.mockReturnValueOnce( {
			editor: {
				isIframeLoaded: false,
				iframePort: {
					postMessage,
				},
			},
		} );

		gutenframeUpdateImageBlocks( { ID: 1234 }, 'deleted' );

		expect( postMessage ).not.toHaveBeenCalled();
	} );

	test( "should call post message with 'deleted' payload", () => {
		const mediaItem = {
			ID: 1234,
		};
		const postMessage = jest.fn();
		getState.mockReturnValueOnce( {
			editor: {
				isIframeLoaded: true,
				iframePort: {
					postMessage,
				},
			},
		} );
		gutenframeUpdateImageBlocks( mediaItem, 'deleted' );

		expect( postMessage ).toHaveBeenCalledWith( {
			action: 'updateImageBlocks',
			payload: expect.objectContaining( {
				id: mediaItem.ID,
				status: 'deleted',
			} ),
		} );
	} );

	test( "should call post message with 'updated' payload", () => {
		const mediaItem = {
			ID: 1234,
		};
		const postMessage = jest.fn();
		getState.mockReturnValueOnce( {
			editor: {
				isIframeLoaded: true,
				iframePort: {
					postMessage,
				},
			},
		} );
		gutenframeUpdateImageBlocks( mediaItem, 'updated' );

		expect( postMessage ).toHaveBeenCalledWith( {
			action: 'updateImageBlocks',
			payload: expect.objectContaining( {
				id: mediaItem.ID,
				status: 'updated',
			} ),
		} );
	} );
} );
