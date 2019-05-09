/**
 * External dependencies
 */
import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';

/**
 * Internal dependencies
 */
import wpcomApiMiddleware from 'state/data-layer/wpcom-api-middleware';
import { reducer as httpData, enhancer as httpDataEnhancer } from 'state/data-layer/http-data';
import { combineReducers } from 'state/utils';
import activePromotions from 'state/active-promotions/reducer';
import application from 'state/application/reducer';
import currentUser from 'state/current-user/reducer';
import documentHead from 'state/document-head/reducer';
import plans from 'state/plans/reducer';
import productsList from 'state/products-list/reducer';
import users from 'state/users/reducer';
import sites from 'state/sites/reducer';
import signup from 'state/signup/reducer';
import language from 'state/ui/language/reducer';
//import layoutFocus from 'state/ui/layout-focus/reducer';

// Create Redux store
const reducer = combineReducers( {
	activePromotions,
	application,
	currentUser,
	documentHead,
	httpData,
	plans,
	productsList,
	users,
	sites,
	signup,
	ui: combineReducers( {
		language,
		// layoutFocus,
	} ),
} );

export default () =>
	createStore(
		reducer,
		compose(
			httpDataEnhancer,
			applyMiddleware( thunkMiddleware, wpcomApiMiddleware )
		)
	);
