/**
 * External dependencies
 */
import { reducer as form } from 'redux-form';

/**
 * Internal dependencies
 */
import config from 'config';
import { combineReducers } from 'state/utils';
import { reducer as httpData } from 'state/data-layer/http-data';

/**
 * Reducers
 */
import account from './account/reducer';
import accountRecovery from './account-recovery/reducer';
import activePromotions from './active-promotions/reducer';
import activityLog from './activity-log/reducer';
import application from './application/reducer';
import applicationPasswords from './application-passwords/reducer';
import automatedTransfer from './automated-transfer/reducer';
import atomicHosting from './hosting/reducer';
import atomicTransfer from './atomic-transfer/reducer';
import billingTransactions from './billing-transactions/reducer';
import checklist from './checklist/reducer';
import comments from './comments/reducer';
import componentsUsageStats from './components-usage-stats/reducer';
import connectedApplications from './connected-applications/reducer';
import countries from './countries/reducer';
import countryStates from './country-states/reducer';
import currentUser from './current-user/reducer';
import { reducer as dataRequests } from './data-layer/wpcom-http/utils';
import documentHead from './document-head/reducer';
import domains from './domains/reducer';
import emailForwarding from './email-forwarding/reducer';
import exporter from './exporter/reducers';
import googleMyBusiness from './google-my-business/reducer';
import gsuiteUsers from './gsuite-users/reducer';
import gutenbergOptInOut from './gutenberg-opt-in-out/reducer';
import happinessEngineers from './happiness-engineers/reducer';
import happychat from './happychat/reducer';
import help from './help/reducer';
import i18n from './i18n/reducer';
import immediateLogin from './immediate-login/reducer';
import importerNux from './importer-nux/reducer';
import imports from './imports/reducer';
import inlineHelp from './inline-help/reducer';
import inlineSupportArticle from './inline-support-article/reducer';
import invites from './invites/reducer';
import jetpack from './jetpack/reducer';
import jetpackConnect from './jetpack-connect/reducer';
import jetpackProductInstall from './jetpack-product-install/reducer';
import jetpackRemoteInstall from './jetpack-remote-install/reducer';
import jetpackSync from './jetpack-sync/reducer';
import jitm from './jitm/reducer';
import login from './login/reducer';
import media from './media/reducer';
import memberships from './memberships/reducer';
import mailchimp from './mailchimp/reducer';
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
import posts from './posts/reducer';
import preferences from './preferences/reducer';
import productsList from './products-list/reducer';
import purchases from './purchases/reducer';
import pushNotifications from './push-notifications/reducer';
import reader from './reader/reducer';
import receipts from './receipts/reducer';
import { rewindReducer as rewind } from './rewind';
import selectedEditor from './selected-editor/reducer';
import sharing from './sharing/reducer';
import shortcodes from './shortcodes/reducer';
import signup from './signup/reducer';
import simplePayments from './simple-payments/reducer';
import siteAddressChange from './site-address-change/reducer';
import siteKeyrings from './site-keyrings/reducer';
import siteRoles from './site-roles/reducer';
import siteSettings from './site-settings/reducer';
import sites from './sites/reducer';
import stats from './stats/reducer';
import storedCards from './stored-cards/reducer';
import support from './support/reducer';
import terms from './terms/reducer';
import themes from './themes/reducer';
import timezones from './timezones/reducer';
import ui from './ui/reducer';
import userDevices from './user-devices/reducer';
import userProfileLinks from './profile-links/reducer';
import userSettings from './user-settings/reducer';
import users from './users/reducer';
import wordads from './wordads/reducer';

const reducers = {
	account,
	accountRecovery,
	activePromotions,
	activityLog,
	application,
	applicationPasswords,
	automatedTransfer,
	atomicHosting,
	atomicTransfer,
	billingTransactions,
	checklist,
	comments,
	componentsUsageStats,
	connectedApplications,
	countries,
	countryStates,
	currentUser,
	dataRequests,
	documentHead,
	domains,
	emailForwarding,
	exporter,
	form,
	googleMyBusiness,
	gsuiteUsers,
	gutenbergOptInOut,
	happinessEngineers,
	happychat,
	help,
	httpData,
	i18n,
	immediateLogin,
	importerNux,
	imports,
	inlineHelp,
	inlineSupportArticle,
	invites,
	jetpack,
	jetpackConnect,
	jetpackProductInstall,
	jetpackRemoteInstall,
	jetpackSync,
	jitm,
	login,
	media,
	memberships,
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
	posts,
	preferences,
	productsList,
	purchases,
	pushNotifications,
	reader,
	receipts,
	rewind,
	selectedEditor,
	sharing,
	shortcodes,
	signup,
	simplePayments,
	siteAddressChange,
	siteKeyrings,
	siteRoles,
	siteSettings,
	sites,
	stats,
	storedCards,
	support,
	terms,
	themes,
	timezones,
	ui,
	userDevices,
	userProfileLinks,
	userSettings,
	users,
	wordads,
};

if ( config.isEnabled( 'mailchimp' ) ) {
	reducers.mailchimp = mailchimp;
}

export default combineReducers( reducers );
