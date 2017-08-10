/** @format */
/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * An empty function that at a high level should look like the olark api provided by https://www.olark.com/api
 */
function olark() {}

olark.configure = noop;
olark.identify = noop;

export default olark;
