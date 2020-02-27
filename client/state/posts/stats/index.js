/**
 * External dependencies
 */
import debugModule from 'debug';
import { get, some } from 'lodash';

/**
 * Internal dependencies
 */
import { bumpStat, recordTracksEvent } from 'state/analytics/actions';
import * as utils from 'state/posts/utils';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { getEditorPostId, isConfirmationSidebarEnabled } from 'state/ui/editor/selectors';
import { getEditedPost, getSitePost } from 'state/posts/selectors';
import getPodcastingCategoryId from 'state/selectors/get-podcasting-category-id';

import { recordEditorEvent } from 'state/posts/stats/record-editor-event';
import { recordEditorStat } from 'state/posts/stats/record-editor-stat';

export { recordEditorEvent } from 'state/posts/stats/record-editor-event';
export { recordEditorStat } from 'state/posts/stats/record-editor-stat';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:posts:stats' );

export const recordSaveEvent = () => ( dispatch, getState ) => {
	const state = getState();
	const siteId = getSelectedSiteId( state );
	const postId = getEditorPostId( state );
	const post = getEditedPost( state, siteId, postId );
	const currentStatus = get( getSitePost( state, siteId, postId ), 'status', 'draft' );
	const confirmationSidebarEnabled = isConfirmationSidebarEnabled( state, siteId );
	const nextStatus = post.status;
	const podcastingCategoryId = getPodcastingCategoryId( state, siteId );
	const isPodcastEpisode =
		podcastingCategoryId &&
		post.terms &&
		post.terms.category &&
		some( post.terms.category, { ID: podcastingCategoryId } );
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
			is_podcast_episode: isPodcastEpisode,
		} )
	);
};
