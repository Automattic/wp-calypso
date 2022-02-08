import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useState, useRef, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import useSiteIntent from '../../../dotcom-fse/lib/site-intent/use-site-intent';
import NuxModal from '../nux-modal';
import contentSubmittedImage from './images/post-published.svg';
import './style.scss';

/**
 * Show the seller celebration modal
 */
const SellerCelebrationModal = () => {
	// conditions to show:
	// - user just finished saving (check)
	// - we are on post editor (check)
	// - editor has not yet displayed modal once (check)
	// - user is a seller
	// - user has not saved site before
	// - content includes product block
	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const [ hasDisplayedModal, setHasDisplayedModal ] = useState( false );
	const isSiteEditor = useSelect( ( select ) => !! select( 'core/edit-site' ) );
	const previousIsEditorSaving = useRef( false );
	const isEditorSaving = useSelect( ( select ) =>
		select( 'core' ).isSavingEntityRecord( 'root', 'site' )
	);
	const intent = useSiteIntent();

	useEffect( () => {
		if (
			isSiteEditor &&
			! isEditorSaving &&
			previousIsEditorSaving.current &&
			! hasDisplayedModal &&
			intent === 'sell'
		) {
			setIsModalOpen( true );
			setHasDisplayedModal( true );
		}
		previousIsEditorSaving.current = isEditorSaving;
	}, [ isEditorSaving, hasDisplayedModal, isSiteEditor, intent ] );

	// if save state has changed and was saving on last render
	// then it has finished saving
	// open modal if content has sell block,

	const closeModal = () => setIsModalOpen( false );
	return (
		<NuxModal
			isOpen={ isModalOpen }
			className="wpcom-site-editor-seller-celebration-modal"
			title={ __( 'Your product is live!', 'full-site-editing' ) }
			description={ __(
				'People can now buy your product online. Start sharing your product with friends and family.',
				'full-site-editing'
			) }
			imageSrc={ contentSubmittedImage }
			actionButtons={
				<Button isPrimary href={ '' }>
					{ __( 'View Post', 'full-site-editing' ) }
				</Button>
			}
			onRequestClose={ closeModal }
			onOpen={ () => recordTracksEvent( 'calypso_editor_wpcom_seller_celebration_modal_show' ) }
		/>
	);
};

export default SellerCelebrationModal;
