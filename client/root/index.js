/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import {
	readerFallback,
	sessionRestore,
} from './controller';

export default function() {
	page( '/', sessionRestore, readerFallback );
}
