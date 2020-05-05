/**
 *
 * Needed for store test
 */

/**
 * Internal dependencies
 */
import site from '../fixtures/site';

const reduxState = {
	sites: {
		items: {
			[ site.ID ]: site,
		},
	},
	currentUser: {
		capabilities: {},
	},
};

export const reduxDispatch = ( action ) => action;
export const reduxGetState = () => reduxState;
