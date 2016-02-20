/**
 * Internal dependencies
 */
import {
	READER_FULLPOST_SET_VISIBILITY
} from 'state/action-types';

export function showReaderFullPost() {
	return {
		type: READER_FULLPOST_SET_VISIBILITY,
		show: true
	};
}

export function hideReaderFullPost() {
	return {
		type: READER_FULLPOST_SET_VISIBILITY,
		show: false
	};
}
