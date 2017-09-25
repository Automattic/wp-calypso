/**
 * External dependencies
 */
import { // depends on time and previous calls
// may need to inject behaviors based on browser/non-browser
debounce, // depends on previous calls
isPlainObject, uniqueId } from 'lodash';

export default {
	debounce,
	isPlainObject,
	uniqueId,
};
