import config from '@automattic/calypso-config';
import Notifications from '@automattic/notifications/src/panel/Notifications';
import page from 'page';
import { createElement } from 'react';
import { connect } from 'react-redux';
import wpcom from 'calypso/lib/wp';
import { recordTracksEvent as recordTracksEventAction } from 'calypso/state/analytics/actions';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import getCurrentLocaleVariant from 'calypso/state/selectors/get-current-locale-variant';
import './style.scss';

export default connect(
	( state ) => ( {
		currentLocaleSlug: getCurrentLocaleVariant( state ) || getCurrentLocaleSlug( state ),
	} ),
	{
		recordTracksEventAction,
	}
)( function ( props ) {
	const localeSlug = props.currentLocaleSlug || config( 'i18n_default_locale_slug' );
	const isShowing = true;
	const isVisible = true;

	const customMiddleware = {
		OPEN_LINK: [
			( store, { href, tracksEvent } ) => {
				if ( tracksEvent ) {
					props.recordTracksEventAction( 'calypso_notifications_' + tracksEvent, {
						link: href,
					} );
				}
				window.open( href, '_blank' );
			},
		],
		OPEN_POST: [
			( store, { siteId, postId } ) => {
				props.recordTracksEventAction( 'calypso_notifications_open_post', {
					site_id: siteId,
					post_id: postId,
				} );
				page( `/read/blogs/${ siteId }/posts/${ postId }` );
			},
		],
		OPEN_COMMENT: [
			( store, { siteId, postId, commentId } ) => {
				props.recordTracksEventAction( 'calypso_notifications_open_comment', {
					site_id: siteId,
					post_id: postId,
					comment_id: commentId,
				} );
				page( `/read/blogs/${ siteId }/posts/${ postId }#comment-${ commentId }` );
			},
		],
		OPEN_SITE: [
			( store, { siteId } ) => {
				props.recordTracksEventAction( 'calypso_notifications_open_site', {
					site_id: siteId,
				} );
				page( `/read/blogs/${ siteId }` );
			},
		],
		VIEW_SETTINGS: [
			() => {
				page( '/me/notifications' );
			},
		],
		EDIT_COMMENT: [
			( store, { siteId, postId, commentId } ) => {
				props.recordTracksEventAction( 'calypso_notifications_edit_comment', {
					site_id: siteId,
					post_id: postId,
					comment_id: commentId,
				} );
				page( `/comment/${ siteId }/${ commentId }?action=edit` );
			},
		],
		ANSWER_PROMPT: [
			( store, { siteId, href } ) => {
				props.recordTracksEventAction( 'calypso_notifications_answer_prompt', {
					site_id: siteId,
				} );
				window.open( href, '_blank' );
			},
		],
	};

	const notificationPanel = createElement( Notifications, {
		customMiddleware,
		isShowing,
		isVisible,
		localeSlug,
		wpcom,
	} );

	return (
		<div id="wpnc-panel" className="wide wpnc__main wpnc_dedicated wpnt-open">
			{ notificationPanel }
		</div>
	);
} );
