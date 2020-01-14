/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import { reducer as httpData } from 'state/data-layer/http-data';

/**
 * Reducers
 */
import application from 'state/application/reducer';
import currentUser from 'state/current-user/reducer';
import documentHead from 'state/document-head/reducer';
import i18n from 'state/i18n/reducer';
import notices from 'state/notices/reducer';
import plans from 'state/plans/reducer';
import preferences from 'state/preferences/reducer';
import productsList from 'state/products-list/reducer';
import purchases from 'state/purchases/reducer';
import sites from 'state/sites/reducer';
import ui from 'state/ui/reducer';
import users from 'state/users/reducer';
import { reducer as dataRequests } from 'state/data-layer/wpcom-http/utils';

const reducers = {
	application,
	currentUser,
	dataRequests,
	documentHead,
	httpData,
	i18n,
	notices,
	plans,
	preferences,
	productsList,
	purchases,
	sites,
	ui,
	users,
};

export default combineReducers( reducers );
