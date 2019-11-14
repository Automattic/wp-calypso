/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { redirectRoot } from './controller';

export default function() {
	page( '/', redirectRoot );
}
