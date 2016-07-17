/*
 * External dependencies
 */
import debugModule from 'debug';
import noop from 'lodash/noop';

/*
 * Internal dependencies
 */
import config from 'config';
import analytics from 'lib/analytics';
import PostEditStore from 'lib/posts/post-edit-store';
import utils from 'lib/posts/utils';
import SitesList from 'lib/sites-list';

/*
 * Module variables
 */
const debug = debugModule( 'calypso:posts:stats' );
const sites = new SitesList();

function recordUsageStats( action, postType ) {
	let source;
	const site = sites.getSelectedSite();

	analytics.mc.bumpStat( 'editor_usage', action );

	if ( site ) {
		source = site.jetpack ? 'jetpack' : 'wpcom';
		analytics.mc.bumpStat( 'editor_usage_' + source, action );

		if ( postType ) {
			analytics.mc.bumpStat( 'editor_cpt_usage_' + source, postType + '_' + action );
		}
	}
}

export function recordStat( action ) {
	analytics.mc.bumpStat( 'editor_actions', action );
}

export function recordEvent( action, label, value ) {
	analytics.ga.recordEvent( 'Editor', action, label, value );
}

export function recordSaveEvent() {
	const post = PostEditStore.get();
	const savedPost = PostEditStore.getSavedPost();

	if ( ! post || ! savedPost ) {
		return;
	}

	const currentStatus = savedPost.status;
	const nextStatus = post.status;
	let tracksEventName = 'calypso_editor_' + post.type + '_';
	let statName = false;
	let statEvent = false;
	let usageAction = false;

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
	} else if ( 'pending' === nextStatus ) {
		tracksEventName += 'pending';
	} else if ( 'future' === nextStatus ) {
		tracksEventName += 'schedule';
		statName = 'status-schedule';
		statEvent = 'Scheduled Post';
	}

	if ( usageAction ) {
		recordUsageStats( usageAction, post.type );
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
		tracksEventName, currentStatus, nextStatus
	);

	analytics.tracks.recordEvent( tracksEventName, {
		post_id: post.ID,
		post_type: post.type,
		visibility: utils.getVisibility( post ),
		current_status: currentStatus,
		next_status: nextStatus
	} );
}

const shouldBumpStat = Math.random() <= 0.01 || config( 'env' ) === 'development';
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
