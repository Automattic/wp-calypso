import { Button } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useState, useRef, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import request from 'wpcom-proxy-request';
import fireworksImage from 'calypso/assets/images/illustrations/fireworks.svg';
import useSiteIntent from '../../../dotcom-fse/lib/site-intent/use-site-intent';
import useHasSeenVideoCelbrationModal from '../../../dotcom-fse/lib/video-celebration-modal/use-has-seen-video-celebration-modal';
import NuxModal from '../nux-modal';

// Shows a celebration modal after a video is first uploaded to a site and the editor is saved.
const VideoCelebrationModalInner = () => {
	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const [ hasDisplayedModal, setHasDisplayedModal ] = useState( false );
	const isSiteEditor = useSelect( ( select ) => !! select( 'core/edit-site' ) );
	const previousIsEditorSaving = useRef( false );
	const { hasSeenVideoCelebrationModal, updateHasSeenVideoCelebrationModal } =
		useHasSeenVideoCelbrationModal();

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
		const maybeRenderVideoCelebrationModal = async () => {
			// Get latest site options since the video may have just been uploaded.
			const siteObj = await request( {
				path: `/sites/${ window._currentSiteId }?http_envelope=1`,
				apiVersion: '1.1',
			} );

			if ( siteObj?.options?.launchpad_checklist_tasks_statuses?.video_uploaded ) {
				setIsModalOpen( true );
				setHasDisplayedModal( true );
				updateHasSeenVideoCelebrationModal( true );
			}
		};

		// Conditions to show modal:
		// - user just finished saving
		// - celebration modal hasn't been viewed/isn't visible
		// - site intent is 'videopress'
		// - site has uploaded a video
		if (
			! isEditorSaving &&
			previousIsEditorSaving.current &&
			! hasDisplayedModal &&
			'videopress' === intent &&
			! hasSeenVideoCelebrationModal
		) {
			maybeRenderVideoCelebrationModal();
		}
		previousIsEditorSaving.current = isEditorSaving;
	}, [
		isEditorSaving,
		hasDisplayedModal,
		intent,
		hasSeenVideoCelebrationModal,
		updateHasSeenVideoCelebrationModal,
	] );

	const closeModal = () => setIsModalOpen( false );
	return (
		<NuxModal
			isOpen={ isModalOpen }
			className="wpcom-site-editor-seller-celebration-modal"
			title={ __( "You've added your first video!", 'full-site-editing' ) }
			description={ __(
				'Feel free to continue editing or go back to setup and launch your site.',
				'full-site-editing'
			) }
			imageSrc={ fireworksImage }
			actionButtons={
				<>
					<Button onClick={ closeModal }>{ __( 'Continue editing', 'full-site-editing' ) }</Button>
					<Button
						isPrimary
						href={ `https://wordpress.com/setup/launchpad?flow=videopress&siteId=${ window._currentSiteId }` }
						target="__blank"
						rel="noopener noreferrer"
					>
						{ __( 'Back to setup', 'full-site-editing' ) }
					</Button>
				</>
			}
			onRequestClose={ closeModal }
		/>
	);
};

const VideoCelebrationModal = () => {
	const intent = useSiteIntent();
	if ( 'videopress' === intent ) {
		return <VideoCelebrationModalInner />;
	}
	return null;
};

export default VideoCelebrationModal;
