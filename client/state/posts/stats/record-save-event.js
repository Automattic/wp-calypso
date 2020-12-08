/**
 * External dependencies
 */
import debugModule from 'debug';
import { get, some } from 'lodash';

/**
 * Internal dependencies
 */
import { bumpStat, recordTracksEvent } from 'calypso/state/analytics/actions';
import { getVisibility, isPublished } from 'calypso/state/posts/utils';
import { getEditedPost, getSitePost } from 'calypso/state/posts/selectors';
import getPodcastingCategoryId from 'calypso/state/selectors/get-podcasting-category-id';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { recordEditorEvent } from 'calypso/state/posts/stats/record-editor-event';
import { recordEditorStat } from 'calypso/state/posts/stats/record-editor-stat';
import { getEditorPostId, isConfirmationSidebarEnabled } from 'calypso/state/editor/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

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

	if ( ! post.ID && ! isPublished( post ) ) {
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
			visibility: getVisibility( post ),
			current_status: currentStatus,
			next_status: nextStatus,
			context: eventContext,
			is_podcast_episode: isPodcastEpisode,
		} )
	);
};
