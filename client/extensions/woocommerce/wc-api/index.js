/** @format */

/**
 * Internal dependencies
 */
import endpoints from './endpoints';
import selectors from './selectors';

export default function createWcApi( methods ) {
	return {
		methods,
		endpoints,
		selectors,
	};
}
