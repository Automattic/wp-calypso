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

/**
 * Reducers
 */
import accountRecovery from './account-recovery/reducer';
import activityLog from './activity-log/reducer';
import atomicTransfer from './atomic-transfer/reducer';
import connectedApplications from './connected-applications/reducer';
import currentUser from './current-user/reducer';
import { reducer as dataRequests } from './data-layer/wpcom-http/utils';
import documentHead from './document-head/reducer';
import emailForwarding from './email-forwarding/reducer';
import embeds from './embeds/reducer';
import experiments from './experiments/reducer';
import exporter from './exporter/reducers';
import gsuiteUsers from './gsuite-users/reducer';
import gutenbergOptInOut from './gutenberg-opt-in-out/reducer';
import happinessEngineers from './happiness-engineers/reducer';
import happychat from './happychat/reducer';
import help from './help/reducer';
import home from './home/reducer';
import i18n from './i18n/reducer';
import immediateLogin from './immediate-login/reducer';
import importerNux from './importer-nux/reducer';
import imports from './imports/reducer';
import inlineSupportArticle from './inline-support-article/reducer';
import jetpackProductInstall from './jetpack-product-install/reducer';
import jetpackRemoteInstall from './jetpack-remote-install/reducer';
import jetpackSync from './jetpack-sync/reducer';
import jitm from './jitm/reducer';
import media from './media/reducer';
import mySites from './my-sites/reducer';
import notices from './notices/reducer';
import notificationSettings from './notification-settings/reducer';
import { unseenCount as notificationsUnseenCount } from './notifications';
import npsSurvey from './nps-survey/reducer';
import oauth2Clients from './oauth2-clients/reducer';
import orderTransactions from './order-transactions/reducer';
import pageTemplates from './page-templates/reducer';
import plans from './plans/reducer';
import plugins from './plugins/reducer';
import postFormats from './post-formats/reducer';
import postTypes from './post-types/reducer';
import productsList from './products-list/reducer';
import pushNotifications from './push-notifications/reducer';
import receipts from './receipts/reducer';
import rewind from './rewind/reducer';
import selectedEditor from './selected-editor/reducer';
import sharing from './sharing/reducer';
import simplePayments from './simple-payments/reducer';
import siteAddressChange from './site-address-change/reducer';
import siteKeyrings from './site-keyrings/reducer';
import siteRoles from './site-roles/reducer';
import siteSettings from './site-settings/reducer';
import sites from './sites/reducer';
import storedCards from './stored-cards/reducer';
import support from './support/reducer';
import timezones from './timezones/reducer';
import ui from './ui/reducer';
import userDevices from './user-devices/reducer';
import userProfileLinks from './profile-links/reducer';
import userSettings from './user-settings/reducer';
import users from './users/reducer';
import wordads from './wordads/reducer';

// Legacy reducers
// The reducers in this list are not modularized, and are always loaded on boot.
// Please do not add to this list. See #39261 and p4TIVU-9lM-p2 for more details.
const reducers = {
	accountRecovery,
	activityLog,
	atomicTransfer,
	connectedApplications,
	currentUser,
	dataRequests,
	documentHead,
	emailForwarding,
	embeds,
	experiments,
	exporter,
	gsuiteUsers,
	gutenbergOptInOut,
	happinessEngineers,
	happychat,
	help,
	home,
	httpData,
	i18n,
	immediateLogin,
	importerNux,
	imports,
	inlineSupportArticle,
	jetpackProductInstall,
	jetpackRemoteInstall,
	jetpackSync,
	jitm,
	media,
	mySites,
	notices,
	notificationSettings,
	notificationsUnseenCount,
	npsSurvey,
	oauth2Clients,
	orderTransactions,
	pageTemplates,
	plans,
	plugins,
	postFormats,
	postTypes,
	productsList,
	pushNotifications,
	receipts,
	rewind,
	selectedEditor,
	sharing,
	simplePayments,
	siteAddressChange,
	siteKeyrings,
	siteRoles,
	siteSettings,
	sites,
	storedCards,
	support,
	timezones,
	ui,
	userDevices,
	userProfileLinks,
	userSettings,
	users,
	wordads,
};

export default combineReducers( reducers );
