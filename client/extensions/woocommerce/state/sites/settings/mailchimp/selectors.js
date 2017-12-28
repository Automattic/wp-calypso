/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'client/state/ui/selectors';

// path to MailChimp setting state branch
const basePath = ( siteId ) => (
	[
		'extensions',
		'woocommerce',
		'sites',
		siteId,
		'settings',
		'mailchimp',
	]
);

/**
 * Returns true if currently requesting MailChimp settings or false otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean}        Whether settings are being requested
 */
export const isRequestingSettings = ( state, siteId ) => {
	const path = [ ...basePath( siteId ), 'settingsRequest' ];

	return get( state, path, false );
};

/**
 * Returns settings request error object
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  siteId  Site ID
 * @return {Object}          error object if present or null otherwise
 */
export const requestingSettingsError = ( state, siteId ) => {
	const path = [ ...basePath( siteId ), 'settingsRequestError' ];

	return get( state, path, null );
};

/**
 * Returns MailChimp settings
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  siteId  Site ID
 * @return {Object}          MailChimp settings
 */
export const mailChimpSettings = ( state, siteId ) => {
	const path = [ ...basePath( siteId ), 'settings' ];

	return get( state, path, {} );
};

/**
 * Returns true if currently submitting MailChimp API key or false otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean}        Whether api key is being submitted
 */
export const isSubmittingApiKey = ( state, siteId ) => {
	const path = [ ...basePath( siteId ), 'apiKeySubmit' ];

	return get( state, path, false );
};

/**
 * Returns true if currently submitting MailChimp newsletter settings or false otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean}        Whether newsletter settings are being submitted
 */
export const isSubmittingNewsletterSetting = ( state, siteId ) => {
	const path = [ ...basePath( siteId ), 'newsletterSettingsSubmit' ];

	return get( state, path, false );
};

/**
 * Returns true if currently submitting MailChimp store information or false otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean}        Whether store informations are being submitted
 */
export const isSubmittingStoreInfo = ( state, siteId ) => {
	const path = [ ...basePath( siteId ), 'storeInfoSubmit' ];

	return get( state, path, false );
};

/**
 * Returns newletter settings submit error object
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  siteId  Site ID
 * @return {Object}          error object if present or null otherwise
 */
export const newsletterSettingsSubmitError = ( state, siteId ) => {
	const path = [ ...basePath( siteId ), 'newsletterSettingsSubmitError' ];

	return get( state, path, false );
};

/**
 * Returns true if current api key is correct.
 * requires at lest one settings fetch to work
 * We assume true until we verify correctnes - for UX purposes
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean}        Whether api key is correct
 */
export const isApiKeyCorrect = ( state, siteId ) => {
	const path = [ ...basePath( siteId ), 'settings', 'mailchimp_account_info_id' ];

	return !! get( state, path, true );
};

/**
 * Returns true if currently requesting MailChimp lists or false otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean}        Whether lists are being requested
 */
export const isRequestingLists = ( state, siteId ) => {
	const path = [ ...basePath( siteId ), 'listsRequest' ];

	return get( state, path, false );
};

/**
 * Returns MailChimp sync status
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  siteId  Site ID
 * @return {Object}          Sync status
 */
export const syncStatus = ( state, siteId ) => {
	const path = [ ...basePath( siteId ), 'syncStatus' ];

	return get( state, path, null );
};

/**
 * Returns true if currently requesting MailChimp sync status or false otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean}        Whether sync status is being requested
 */
export const isRequestingSyncStatus = ( state, siteId ) => {
	const path = [ ...basePath( siteId ), 'syncStatusRequest' ];

	return get( state, path, false );
};

/**
 * Returns true if MailChimp plugin is configured correctly and has connection to server
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean}        Wheter setup is compleate
 */
export const hasMailChimpConnection = ( state, siteId = getSelectedSiteId( state ) ) => {
	const path = [ ...basePath( siteId ), 'syncStatus', 'mailchimp_list_name' ];
	const list = get( state, path, false );
	if ( false === list ) {
		return false;
	}

	if ( 'n\/a' !== list ) {
		return true;
	}

	return false;
};

/**
 * Returns true if currently requesting MailChimp resync procedure or false otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean}        Whether resync procedure is being requested
 */
export const isRequestingResync = ( state, siteId ) => {
	const path = [ ...basePath( siteId ), 'resyncRequest' ];

	return get( state, path, false );
};

/**
 * Returns true if user requested save action in MailChimp dashboard.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean}        Whether user requested save action.
 */
export const isSavingSettings = ( state, siteId ) => {
	const path = [ ...basePath( siteId ), 'saveSettings' ];

	return get( state, path, false );
};
