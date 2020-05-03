/**
 * External dependencies
 */

import {
	debounce, // depends on time and previous calls
	isPlainObject, // may need to inject behaviors based on browser/non-browser
	uniqueId, // depends on previous calls
} from 'lodash';

export default {
	debounce,
	isPlainObject,
	uniqueId,
};
