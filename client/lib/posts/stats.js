/** @format */
/**
 * External dependencies
 */
import debugModule from 'debug';
import { get, noop } from 'lodash';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import * as utils from 'lib/posts/utils';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { getEditorPostId, isConfirmationSidebarEnabled } from 'state/ui/editor/selectors';
import { getEditedPost, getSitePost } from 'state/posts/selectors';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:posts:stats' );

function recordUsageStats( siteIsJetpack, action, postType ) {
	analytics.mc.bumpStat( 'editor_usage', action );

	const source = siteIsJetpack ? 'jetpack' : 'wpcom';
	analytics.mc.bumpStat( 'editor_usage_' + source, action );

	if ( postType ) {
		analytics.mc.bumpStat( 'editor_cpt_usage_' + source, postType + '_' + action );
	}
}

export function recordStat( action ) {
	analytics.mc.bumpStat( 'editor_actions', action );
}

export function recordEvent( action, label, value ) {
	analytics.ga.recordEvent( 'Editor', action, label, value );
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
		recordUsageStats( isJetpackSite( state, siteId ), usageAction, post.type );
	}

	// if this action has an mc stat name, record it
	if ( statName ) {
		recordStat( statName );
	}

	// if this action has a GA event, record it
	if ( statEvent ) {
		recordEvent( statEvent );
	}

	debug(
		'recordSaveEvent %s currentStatus=%s nextStatus=%s',
		tracksEventName,
		currentStatus,
		nextStatus
	);

	analytics.tracks.recordEvent( tracksEventName, {
		post_id: post.ID,
		post_type: post.type,
		visibility: utils.getVisibility( post ),
		current_status: currentStatus,
		next_status: nextStatus,
		context: eventContext,
	} );
};

const shouldBumpStat = Math.random() <= 0.01 || process.env.NODE_ENV === 'development';
const maybeBumpStat = shouldBumpStat ? analytics.mc.bumpStat : noop;

export function recordTinyMCEButtonClick( buttonName ) {
	maybeBumpStat( 'editor-button', 'calypso_' + buttonName );
	analytics.ga.recordEvent( 'Editor', 'Clicked TinyMCE Button', buttonName );
	debug( 'TinyMCE button click', buttonName, 'mc=', shouldBumpStat );
}

export function recordTinyMCEHTMLButtonClick( buttonName ) {
	maybeBumpStat( 'html-editor-button', 'calypso_' + buttonName );
	analytics.ga.recordEvent( 'Editor', 'Clicked TinyMCE HTML Button', buttonName );
	debug( 'TinyMCE HTML button click', buttonName, 'mc=', shouldBumpStat );
}
