/**
 * Internal dependencies
 */
import {
	READER_FULLPOST_HIDE,
	READER_FULLPOST_SHOW
} from 'state/action-types';

export function showReaderFullPost() {
	return {
		type: READER_FULLPOST_SHOW
	};
}

export function hideReaderFullPost() {
	return {
		type: READER_FULLPOST_HIDE
	};
}
