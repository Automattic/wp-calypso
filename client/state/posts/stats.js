/** @format */
/**
 * External dependencies
 */
import debugModule from 'debug';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { bumpStat, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import * as utils from 'state/posts/utils';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { getEditorPostId, isConfirmationSidebarEnabled } from 'state/ui/editor/selectors';
import { getEditedPost, getSitePost } from 'state/posts/selectors';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:posts:stats' );

export function recordEditorStat( action ) {
	return bumpStat( 'editor_actions', action );
}

export function recordEditorEvent( action, label, value ) {
	return recordGoogleEvent( 'Editor', action, label, value );
}

export const recordSaveEvent = () => ( dispatch, getState ) => {
	const state = getState();
	const siteId = getSelectedSiteId( state );
	const postId = getEditorPostId( state );
	const post = getEditedPost( state, siteId, postId );
	const currentStatus = get( getSitePost( state, siteId, postId ), 'status', 'draft' );
	const confirmationSidebarEnabled = isConfirmationSidebarEnabled( state, siteId );
	const nextStatus = post.status;
	let tracksEventName = 'calypso_editor_';
	let statName = false;
	let statEvent = false;
	let usageAction = false;
	let eventContext = null;

	if ( ! post.ID && ! utils.isPublished( post ) ) {
		tracksEventName += 'savedraft';
	} else if ( 'draft' === nextStatus ) {
		tracksEventName += 'savedraft';
	} else if ( currentStatus === nextStatus ) {
		usageAction = 'edit';
		tracksEventName += 'update';
	} else if ( 'publish' === nextStatus || 'private' === nextStatus ) {
		tracksEventName += 'publish';
		usageAction = 'new';
		if ( confirmationSidebarEnabled ) {
			eventContext = 'confirmation_sidebar';
		}
	} else if ( 'pending' === nextStatus ) {
		tracksEventName += 'pending';
	} else if ( 'future' === nextStatus ) {
		tracksEventName += 'schedule';
		statName = 'status-schedule';
		statEvent = 'Scheduled Post';
		if ( confirmationSidebarEnabled ) {
			eventContext = 'confirmation_sidebar';
		}
	}

	if ( usageAction ) {
		const source = isJetpackSite( state, siteId ) ? 'jetpack' : 'wpcom';

		dispatch( bumpStat( 'editor_usage', usageAction ) );
		dispatch( bumpStat( 'editor_usage_' + source, usageAction ) );
		if ( post.type ) {
			dispatch( bumpStat( 'editor_cpt_usage_' + source, post.type + '_' + usageAction ) );
		}
	}

	// if this action has an mc stat name, record it
	if ( statName ) {
		dispatch( recordEditorStat( statName ) );
	}

	// if this action has a GA event, record it
	if ( statEvent ) {
		dispatch( recordEditorEvent( statEvent ) );
	}

	debug(
		'recordSaveEvent %s currentStatus=%s nextStatus=%s',
		tracksEventName,
		currentStatus,
		nextStatus
	);

	dispatch(
		recordTracksEvent( tracksEventName, {
			post_id: post.ID,
			post_type: post.type,
			visibility: utils.getVisibility( post ),
			current_status: currentStatus,
			next_status: nextStatus,
			context: eventContext,
		} )
	);
};
