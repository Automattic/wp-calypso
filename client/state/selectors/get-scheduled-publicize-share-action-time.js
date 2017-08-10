/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';
import { moment } from 'i18n-calypso';
/**
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @param {Number} postId Post ID
 * @return {String|false} time when newly scheduled share action will be published
 */
export default function getScheduledPublicizeShareActionTime( state, siteId, postId ) {
	const date = get(
		state,
		[
			'sharing',
			'publicize',
			'sharePostActions',
			'schedulingSharePostActionStatus',
			siteId,
			postId,
			'shareDate',
		],
		false
	);
	if ( date ) {
		return moment( new Date( date * 1000 ) );
	}
	return false;
}
