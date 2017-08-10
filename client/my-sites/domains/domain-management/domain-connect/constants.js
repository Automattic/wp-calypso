/** @format */
/**
 * External dependencies
 */
import keyMirror from 'key-mirror';

export const actionType = keyMirror( {
	CLOSE: null,
	READY_TO_SUBMIT: null,
	SUBMITTING: null,
} );

export const noticeType = {
	ERROR: 'is-error',
	SUCCESS: 'is-success',
};
