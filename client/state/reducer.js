// The eslint configuration below helps prevent new legacy reducers from being added.
// See `docs/modularized-state.md` to learn more about modularized state.

/*eslint no-restricted-imports: ["error", {
    "patterns": ["./*\/reducer*", "state/*\/reducer*"]
}]*/

/**
 * Internal dependencies
 */
import { combineReducers } from 'calypso/state/utils';
import { reducer as httpData } from 'calypso/state/data-layer/http-data';

/**
 * Reducers
 */
import atomicTransfer from './atomic-transfer/reducer';
import currentUser from './current-user/reducer';
import { reducer as dataRequests } from './data-layer/wpcom-http/utils';
import documentHead from './document-head/reducer';
import i18n from './i18n/reducer';
import importerNux from './importer-nux/reducer';
import inlineSupportArticle from './inline-support-article/reducer';
import jitm from './jitm/reducer';
import mySites from './my-sites/reducer';
import notices from './notices/reducer';
import selectedEditor from './selected-editor/reducer';
import sites from './sites/reducer';
import support from './support/reducer';
import userSettings from './user-settings/reducer';
import users from './users/reducer';

// Legacy reducers
// The reducers in this list are not modularized, and are always loaded on boot.
// Please do not add to this list. See #39261 and p4TIVU-9lM-p2 for more details.
const reducers = {
	atomicTransfer,
	currentUser,
	dataRequests,
	documentHead,
	httpData,
	i18n,
	importerNux,
	inlineSupportArticle,
	jitm,
	mySites,
	notices,
	selectedEditor,
	sites,
	support,
	userSettings,
	users,
};

export default combineReducers( reducers );
