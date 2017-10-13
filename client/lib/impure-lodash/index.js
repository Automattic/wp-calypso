/**
 * External dependencies
 *
 * @format
 */

import {
	debounce, // depends on time and previous calls
	isPlainObject, // may need to inject behaviors based on browser/non-browser
	uniqueId, // depends on previous calls
} from 'lodash';

const exported = {
	debounce,
	isPlainObject,
	uniqueId,
};

export default exported;
export { debounce, isPlainObject, uniqueId };
