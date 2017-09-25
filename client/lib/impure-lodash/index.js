/**
 * External dependencies
 */
import { // depends on time and previous calls
debounce, // may need to inject behaviors based on browser/non-browser
isPlainObject, // depends on previous calls
uniqueId } from 'lodash';

export default {
	debounce,
	isPlainObject,
	uniqueId,
};
