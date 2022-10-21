import { useSelect } from '@wordpress/data';
import { useRef, useEffect } from '@wordpress/element';
import useSiteIntent from '../../../dotcom-fse/lib/site-intent/use-site-intent';
import useLaunchPadCheckListTasksStatuses from '../../../dotcom-fse/lib/site-launchpad-statuses/use-launchpad-checklist-tasks-statuses';
import './style.scss';

const VideoPressUploadRedirectInner = () => {
	// conditions to redirect:
	// - user just finished saving (check)
	// - user has not saved site before
	// - site has uploaded a video
	// - site intent is 'videopress'

	const isSiteEditor = useSelect( ( select ) => !! select( 'core/edit-site' ) );
	const previousIsEditorSaving = useRef( false );

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
	const launchpadChecklistStatuses = useLaunchPadCheckListTasksStatuses( window._currentSiteId );
	const videoPressUploadCompleted = launchpadChecklistStatuses?.video_uploaded || false;

	useEffect( () => {
		console.log(
			! isEditorSaving,
			previousIsEditorSaving.current,
			intent === 'videopress',
			videoPressUploadCompleted
		);
		if (
			! isEditorSaving &&
			previousIsEditorSaving.current &&
			intent === 'videopress' &&
			videoPressUploadCompleted
		) {
			window.location.href = `http://calypso.localhost:3000/setup/launchpad?flow=videopress&siteId=${ window._currentSiteId }`;
		}
		previousIsEditorSaving.current = isEditorSaving;
	}, [ isEditorSaving, intent, videoPressUploadCompleted ] );

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
