/**
 * External dependencies
 */
import { createReduxStore, register } from '@wordpress/data';
/**
 * Internal dependencies
 */
import { unstableResourceWarning } from '../../../../debug';
import * as actions from './actions';
import { STORE_NAME } from './constants';
import reducer from './reducer';
import * as selectors from './selectors';

export const storeConfig = {
	reducer,
	actions,
	selectors,
};

export const store = createReduxStore( STORE_NAME, storeConfig );

unstableResourceWarning(
	`${ STORE_NAME } store`,
	'https://github.com/WordPress/gutenberg/blob/a89831f1da023d2e2735a50c75a1ca837efa91ea/packages/edit-site/src/store/index.js#L23'
);
register( store );
