/**
 * External dependencies
 */
import uniqueId from 'lodash/uniqueId';

/**
 * Internal dependencies
 */
import {
	NOTICE_CREATE,
	NOTICE_REMOVE
} from 'state/action-types';

export function removeNotice( noticeId ) {
	return {
		noticeId: noticeId,
		type: NOTICE_REMOVE
	};
}

/**
 * Returns an action object used in signalling that a global notice is to be
 * created.
 *
 * @param  {String}   status                    Notice status (e.g. is-success)
 * @param  {String}   text                      Notice text
 * @param  {Object}   options                   Notice options
 * @param  {String}   options.id                Custom notice ID
 * @param  {Number}   options.duration          Notice duration (milliseconds),
 *                                              defaulting to shown forever
 * @param  {Boolean}  options.showDismiss       Enable user to dismiss notice,
 *                                              defaulting to true
 * @param  {Boolean}  options.isPersistent      Whether notice should continue
 *                                              to show after navigating
 * @param  {Boolean}  options.displayOnNextPage Whether notice should be shown
 *                                              on the next screen
 * @param  {Object[]} options.actions           Notice actions
 * @return {Object}                             Action object
 */
export function createNotice( status, text, options = {} ) {
	const {
		id: noticeId = uniqueId(),
		duration,
		showDismiss = true,
		isPersistent,
		displayOnNextPage,
		actions
	} = options;

	return {
		type: NOTICE_CREATE,
		notice: {
			noticeId,
			duration,
			showDismiss,
			isPersistent,
			displayOnNextPage,
			actions,
			status,
			text
		}
	};
}

export const successNotice = createNotice.bind( null, 'is-success' );
export const errorNotice = createNotice.bind( null, 'is-error' );
export const infoNotice = createNotice.bind( null, 'is-info' );
export const warningNotice = createNotice.bind( null, 'is-warning' );
