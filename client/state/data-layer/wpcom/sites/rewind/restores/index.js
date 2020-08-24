/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { errorNotice } from 'state/notices/actions';
import { registerHandlers } from 'state/data-layer/handler-registry';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { REWIND_RESTORE_DISMISS_PROGRESS } from 'state/action-types';

/**
 * Mark a specific restore record as dismissed.
 * This has the effect that subsequent calls to /sites/%site_id%/rewind/restores won't return the restore.
 *
 * @param   {object}   action   Changeset to update state.
 * @returns {object}          The dispatched action.
 */
export const dismissRestore = ( action ) =>
	http(
		{
			method: 'POST',
			apiNamespace: 'wpcom/v2',
			path: `/sites/${ action.siteId }/rewind/restores/${ action.restoreId }`,
			body: {
				dismissed: true,
			},
		},
		action
	);

/**
 * On successful dismiss, the card will be removed and we don't need to do anything further.
 * If request succeeded but restore couldn't be dismissed, a notice will be shown.
 *
 * @param {object}   action   Changeset to update state.
 * @param {object}     data     Description of request result.
 * @returns {Function} The dispatched action.
 */
export const restoreSilentlyDismissed = ( action, data ) =>
	! data.dismissed
		? errorNotice( translate( 'Dismissing restore failed. Please reload and try again.' ) )
		: null;

/**
 * If a dismiss request fails, an error notice will be shown.
 *
 * @returns {Function} The dispatched action.
 */
export const restoreDismissFailed = () => null;

/**
 * Parse and merge response data for restore dismiss result with defaults.
 *
 * @param   {object} data   The data received from API response.
 * @returns {object} Parsed response data.
 */
const fromRestoreDismiss = ( data ) => ( {
	restoreId: parseInt( data.restore_id ),
	dismissed: data.is_dismissed,
} );

registerHandlers( 'state/data-layer/wpcom/sites/rewind/restores', {
	[ REWIND_RESTORE_DISMISS_PROGRESS ]: [
		dispatchRequest( {
			fetch: dismissRestore,
			onSuccess: restoreSilentlyDismissed,
			onError: restoreDismissFailed,
			fromApi: fromRestoreDismiss,
		} ),
	],
} );
