/**
 * Internal dependencies
 */
import { getBaseTime, getTransientDate } from 'state/media/utils/transient-date';

/**
 * Creates a function that serially uploads a list of media files using
 * the passed in thunk.
 *
 * @param {Function} mediaAddingAction Dispatchable action accepting a file as a first argument and date as the last argument
 */
export const serially = ( mediaAddingAction ) => ( files, ...extraArgs ) => ( dispatch ) => {
	const baseTime = getBaseTime();
	const fileCount = files.length;

	return files.reduce( async ( previousUpload, file, index ) => {
		await previousUpload;
		const transientDate = getTransientDate( baseTime, index, fileCount );
		try {
			return await dispatch( mediaAddingAction( file, ...extraArgs, transientDate ) );
		} catch {
			// Swallow the error because inner `mediaAddingAction` will have already handled it
			return Promise.resolve();
		}
	}, Promise.resolve() );
};
