import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import NuxModal from '../nux-modal';
import contentSubmittedImage from './images/post-published.svg';
import './style.scss';

/**
 * Show the first post publish modal
 */
const SellerCelebrationModal: React.FC = () => {
	const [ isOpen, setIsOpen ] = useState( false );
	const closeModal = () => setIsOpen( false );
	const isSiteEditor = useSelect( ( select ) => !! select( 'core/edit-site' ) );

	if ( ! isSiteEditor ) {
		return null;
	}

	return (
		<NuxModal
			isOpen={ isOpen }
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
