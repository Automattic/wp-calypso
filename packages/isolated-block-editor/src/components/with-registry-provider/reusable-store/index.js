/**
 * Internal dependencies
 */
import * as actions from './actions';
import controls from './controls';
import reducer from './reducer';
import * as selectors from './selectors';

/**
 * Data store configuration.
 *
 * @see https://github.com/WordPress/gutenberg/blob/HEAD/packages/data/README.md#registerStore
 *
 * @type {Object}
 */
export default {
	actions,
	controls,
	reducer,
	selectors,
};
