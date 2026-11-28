import { getCalypsoUrl } from '@automattic/calypso-url';
import { dispatch, select, subscribe } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import tracksRecordEvent from './tracking/track-record-event';

/**
 * On sites whose plan doesn't include video uploads, dropping a video into
 * blocks like Cover, Story, Slideshow, or Media & Text surfaces the generic
 * core error "Sorry, you are not allowed to upload this file type." as a
 * snackbar notice, with no hint that upgrading the plan would fix it.
 *
 * This feature watches the notices store and replaces that notice with an
 * upgrade nudge when the rejected file is a video. On plans that support
 * video uploads the error never fires for video files, so no plan check is
 * needed. Non-video rejections (e.g. .exe) keep the original error.
 * @see https://linear.app/a8c/issue/EDI-195
 */

// Video extensions accepted by WordPress core, matched against the file name
// prefix that @wordpress/media-utils includes in the error message.
const VIDEO_FILE_IN_MESSAGE =
	/\.(asf|asx|avi|divx|flv|mkv|mov|mp4|m4v|mpe|mpeg|mpg|ogv|qt|webm|wm|wmv|wmx|3g2|3gp|3gp2|3gpp)\s*:/i;

// The same sentence is produced client-side by @wordpress/media-utils and
// server-side by core uploads; matching its translation keeps this working in
// every locale.
const coreUploadError = () => __( 'Sorry, you are not allowed to upload this file type.' );

const seenNoticeIds = new Set();
let previousNotices;

subscribe( () => {
	const notices = select( 'core/notices' ).getNotices();
	if ( notices === previousNotices ) {
		return;
	}
	previousNotices = notices;

	for ( const notice of notices ) {
		if ( seenNoticeIds.has( notice.id ) ) {
			continue;
		}
		seenNoticeIds.add( notice.id );

		if (
			notice.status !== 'error' ||
			typeof notice.content !== 'string' ||
			! notice.content.includes( coreUploadError() ) ||
			! VIDEO_FILE_IN_MESSAGE.test( notice.content )
		) {
			continue;
		}

		dispatch( 'core/notices' ).removeNotice( notice.id );
		dispatch( 'core/notices' ).createErrorNotice(
			__( 'Your site’s plan doesn’t support video uploads. Upgrade your plan to upload videos.' ),
			{
				type: notice.type,
				actions: [
					{
						label: __( 'Upgrade plan' ),
						url: `${ getCalypsoUrl() }/plans/${ window._currentSiteId }`,
					},
				],
			}
		);
		tracksRecordEvent( 'wpcom_block_editor_video_upload_plan_nudge_show' );
	}
} );
