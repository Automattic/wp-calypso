import { useSelect } from '@wordpress/data';
import { useRef, useEffect } from '@wordpress/element';
import request from 'wpcom-proxy-request';
import useSiteIntent from '../../../dotcom-fse/lib/site-intent/use-site-intent';
import useHasRedirectedAfterVideoUpload from '../../../dotcom-fse/lib/video-upload-redirect/use-has-redirected-after-video-upload';

// Redirects a user back to the VideoPress onboarding launchpad after uploading a video and saving their site.
const VideoPressUploadRedirectInner = () => {
	const isSiteEditor = useSelect( ( select ) => !! select( 'core/edit-site' ) );
	const previousIsEditorSaving = useRef( false );
	const { hasRedirectedAfterVideoUpload, updateHasRedirectedAfterVideoUpload } =
		useHasRedirectedAfterVideoUpload();

	const { isEditorSaving } = useSelect( ( select ) => {
		if ( isSiteEditor ) {
			const isSavingSite =
				select( 'core' ).isSavingEntityRecord( 'root', 'site' ) &&
				! select( 'core' ).isAutosavingEntityRecord( 'root', 'site' );

			const page = select( 'core/edit-site' ).getPage();
			const pageId = parseInt( page?.context?.postId );
			const isSavingEntity =
				select( 'core' ).isSavingEntityRecord( 'postType', 'page', pageId ) &&
				! select( 'core' ).isAutosavingEntityRecord( 'postType', 'page', pageId );
			const pageEntity = select( 'core' ).getEntityRecord( 'postType', 'page', pageId );

			return {
				isEditorSaving: isSavingSite || isSavingEntity,
				linkUrl: pageEntity?.link,
			};
		}

		const currentPost = select( 'core/editor' ).getCurrentPost();
		const isSavingEntity =
			select( 'core' ).isSavingEntityRecord( 'postType', currentPost?.type, currentPost?.id ) &&
			! select( 'core' ).isAutosavingEntityRecord( 'postType', currentPost?.type, currentPost?.id );

		return {
			isEditorSaving: isSavingEntity,
		};
	} );

	const intent = useSiteIntent();

	useEffect( () => {
		const maybeRedirectAfterVideoUpload = async () => {
			// Get latest site options since the video may have just been uploaded.
			const siteObj = await request( {
				path: `/sites/${ window._currentSiteId }?http_envelope=1`,
				apiVersion: '1.1',
			} );

			if ( siteObj?.options?.launchpad_checklist_tasks_statuses?.video_uploaded ) {
				updateHasRedirectedAfterVideoUpload( true );
				window.location.href = `https://wordpress.com/setup/launchpad?flow=videopress&siteId=${ window._currentSiteId }`;
			}
		};

		// Conditions to redirect:
		// - user just finished saving
		// - site intent is 'videopress'
		// - video redirect hasn't already occurred
		// - site has uploaded a video
		if (
			! isEditorSaving &&
			previousIsEditorSaving.current &&
			'videopress' === intent &&
			! hasRedirectedAfterVideoUpload
		) {
			maybeRedirectAfterVideoUpload();
		}
		previousIsEditorSaving.current = isEditorSaving;
	}, [
		isEditorSaving,
		intent,
		hasRedirectedAfterVideoUpload,
		updateHasRedirectedAfterVideoUpload,
	] );

	return null;
};

const VideoPressUploadRedirect = () => {
	const intent = useSiteIntent();
	if ( 'videopress' === intent ) {
		return <VideoPressUploadRedirectInner />;
	}
	return null;
};

export default VideoPressUploadRedirect;
