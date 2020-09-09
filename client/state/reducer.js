// The eslint configuration below helps prevent new legacy reducers from being added.
// See `docs/modularized-state.md` to learn more about modularized state.

/*eslint no-restricted-imports: ["error", {
    "patterns": ["./*\/reducer*", "state/*\/reducer*"]
}]*/

/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import { reducer as httpData } from 'state/data-layer/http-data';
import config from 'config';

/**
 * Reducers
 */
import atomicTransfer from './atomic-transfer/reducer';
import currentUser from './current-user/reducer';
import { reducer as dataRequests } from './data-layer/wpcom-http/utils';
import documentHead from './document-head/reducer';
import embeds from './embeds/reducer';
import experiments from './experiments/reducer';
import gsuiteUsers from './gsuite-users/reducer';
import happychat from './happychat/reducer';
import i18n from './i18n/reducer';
import immediateLogin from './immediate-login/reducer';
import importerNux from './importer-nux/reducer';
import inlineSupportArticle from './inline-support-article/reducer';
import jetpackSync from './jetpack-sync/reducer';
import jitm from './jitm/reducer';
import media from './media/reducer';
import mySites from './my-sites/reducer';
import notices from './notices/reducer';
import { unseenCount as notificationsUnseenCount } from './notifications';
import orderTransactions from './order-transactions/reducer';
import pageTemplates from './page-templates/reducer';
import postFormats from './post-formats/reducer';
import receipts from './receipts/reducer';
import rewind from './rewind/reducer';
import selectedEditor from './selected-editor/reducer';
import simplePayments from './simple-payments/reducer';
import siteAddressChange from './site-address-change/reducer';
import siteKeyrings from './site-keyrings/reducer';
import siteRoles from './site-roles/reducer';
import sites from './sites/reducer';
import storedCards from './stored-cards/reducer';
import support from './support/reducer';
import ui from './ui/reducer';
import userDevices from './user-devices/reducer';
import userProfileLinks from './profile-links/reducer';
import userSettings from './user-settings/reducer';
import users from './users/reducer';
import adminMenu from './admin-menu/reducer';

// Legacy reducers
// The reducers in this list are not modularized, and are always loaded on boot.
// Please do not add to this list. See #39261 and p4TIVU-9lM-p2 for more details.
const reducers = {
	atomicTransfer,
	currentUser,
	dataRequests,
	documentHead,
	embeds,
	experiments,
	gsuiteUsers,
	happychat,
	httpData,
	i18n,
	immediateLogin,
	importerNux,
	inlineSupportArticle,
	jetpackSync,
	jitm,
	media,
	mySites,
	notices,
	notificationsUnseenCount,
	orderTransactions,
	pageTemplates,
	postFormats,
	receipts,
	rewind,
	selectedEditor,
	simplePayments,
	siteAddressChange,
	siteKeyrings,
	siteRoles,
	sites,
	storedCards,
	support,
	ui,
	userDevices,
	userProfileLinks,
	userSettings,
	users,
	// TODO: remove this once admin-menu state is consumed by UI components
	// to allow it to be loaded as modularized state.
	...( config.isEnabled( 'nav-unification' ) && { adminMenu } ),
};

export default combineReducers( reducers );
