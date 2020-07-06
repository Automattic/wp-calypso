/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { getBaseTime, getTransientDate } from 'state/media/utils/transient-date';

/**
 * Creates a function that serially uploads a list of media files using
 * the passed in thunk.
 *
 * @param {Function} mediaAddingAction Dispatchable action accepting a file as a first argument and date as the last argument
 * @param {((object) => void)?} onItemUploaded Optional function to be called when an item succeeds
 * @param {((object) => void)?} onItemFailure Optional function to be called when an item fails
 * @returns {import('redux-thunk').ThunkAction<Promise<object[]>, any, any>} A thunk resolving in the uploaded items
 */
export const serially = ( mediaAddingAction, onItemUploaded = noop, onItemFailure = noop ) => (
	files,
	...extraArgs
) => async ( dispatch ) => {
	const baseTime = getBaseTime();
	const fileCount = files.length;
	const uploadedItems = [];

	await files.reduce( async ( previousUpload, file, index ) => {
		await previousUpload;
		const transientDate = getTransientDate( baseTime, index, fileCount );
		try {
			const mediaItem = await dispatch( mediaAddingAction( file, ...extraArgs, transientDate ) );
			onItemUploaded( mediaItem, file );
			uploadedItems.push( mediaItem );
			return mediaItem;
		} catch {
			onItemFailure( file );
			// Swallow the error because inner `mediaAddingAction` will have already handled it
			return Promise.resolve();
		}
	}, Promise.resolve() );

	return uploadedItems;
};
