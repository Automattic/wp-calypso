import { Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import NuxModal from '../nux-modal';
import postPublishedImage from './images/post-published.svg';
import './style.scss';

/**
 * Show the first post publish modal
 */
const PostPublishedModal: React.FC = () => {
	const { link } = useSelect( ( select ) => select( 'core/editor' ).getCurrentPost() );
	const postType = useSelect( ( select ) => select( 'core/editor' ).getCurrentPostType() );

	const isCurrentPostPublished = useSelect( ( select ) =>
		select( 'core/editor' ).isCurrentPostPublished()
	);
	const previousIsCurrentPostPublished = useRef( isCurrentPostPublished );
	const shouldShowFirstPostPublishedModal = useSelect( ( select ) =>
		select( 'automattic/wpcom-welcome-guide' ).getShouldShowFirstPostPublishedModal()
	);
	const [ isOpen, setIsOpen ] = useState( false );
	const closeModal = () => setIsOpen( false );
	const {
		fetchShouldShowFirstPostPublishedModal,
		setShouldShowFirstPostPublishedModal,
	} = useDispatch( 'automattic/wpcom-welcome-guide' );

	useEffect( () => {
		fetchShouldShowFirstPostPublishedModal();
	}, [ fetchShouldShowFirstPostPublishedModal ] );
	useEffect( () => {
		// If the user is set to see the first post modal and current post status changes to publish,
		// open the post publish modal
		if (
			shouldShowFirstPostPublishedModal &&
			! previousIsCurrentPostPublished.current &&
			isCurrentPostPublished &&
			postType === 'post'
		) {
			previousIsCurrentPostPublished.current = isCurrentPostPublished;
			setShouldShowFirstPostPublishedModal( false );

			// When the post published panel shows, it is focused automatically.
			// Thus, we need to delay open the modal so that the modal would not be close immediately
			// because the outside of modal is focused
			window.setTimeout( () => {
				setIsOpen( true );
			} );
		}
	}, [
		postType,
		shouldShowFirstPostPublishedModal,
		isCurrentPostPublished,
		setShouldShowFirstPostPublishedModal,
	] );

	return (
		<NuxModal
			isOpen={ isOpen }
			className="wpcom-block-editor-post-published-modal"
			title={ __( 'Your first post is published!', 'full-site-editing' ) }
			description={ __(
				'Congratulations! You did it. View your post to see how it will look on your site.',
				'full-site-editing'
			) }
			imageSrc={ postPublishedImage }
			actionButtons={
				<Button isPrimary href={ link }>
					{ __( 'View Post', 'full-site-editing' ) }
				</Button>
			}
			onRequestClose={ closeModal }
		/>
	);
};

export default PostPublishedModal;
