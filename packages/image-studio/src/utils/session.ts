/**
 * Session utilities for Image Studio
 *
 * The store mints a session when Image Studio opens and when navigating
 * between images.
 */
import { select } from '@wordpress/data';
import { store as imageStudioStore } from '../store';

/**
 * Get the session ID for the image currently open.
 * @returns The current session ID, or an empty string before Image Studio opens.
 */
export function getSessionId(): string {
	try {
		return select( imageStudioStore )?.getSessionId() ?? '';
	} catch ( error ) {
		// Store may not be registered yet
		return '';
	}
}
