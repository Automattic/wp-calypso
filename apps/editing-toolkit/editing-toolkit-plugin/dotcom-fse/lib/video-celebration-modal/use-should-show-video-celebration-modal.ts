import { useState, useEffect } from '@wordpress/element';
import request from 'wpcom-proxy-request';
import useSiteIntent from '../site-intent/use-site-intent';
import useHasSeenVideoCelbrationModal from './use-has-seen-video-celebration-modal';

interface Site {
	options?: {
		launchpad_checklist_tasks_statuses?: {
			video_uploaded: boolean;
		};
	};
}
const useShouldShowVideoCelebrationModal = ( isEditorSaving: boolean ) => {
	const { siteIntent: intent } = useSiteIntent();

	const [ shouldShowVideoCelebrationModal, setShouldShowVideoCelebrationModal ] = useState( false );
	const { hasSeenVideoCelebrationModal } = useHasSeenVideoCelbrationModal();

	useEffect( () => {
		const maybeRenderVideoCelebrationModal = async () => {
			// Get latest site options since the video may have just been uploaded.
			const siteObj = await request( {
				path: `/sites/${ window._currentSiteId }?http_envelope=1`,
				apiVersion: '1.1',
			} ) as Site;

			if ( siteObj?.options?.launchpad_checklist_tasks_statuses?.video_uploaded ) {
				setShouldShowVideoCelebrationModal( true );
			}
		};

		if ( 'videopress' === intent && ! hasSeenVideoCelebrationModal ) {
			maybeRenderVideoCelebrationModal();
		}
	}, [
		isEditorSaving, // included so that we check whether the video has been uploaded on save.
		intent,
		hasSeenVideoCelebrationModal,
	] );
	return shouldShowVideoCelebrationModal;
};
export default useShouldShowVideoCelebrationModal;
