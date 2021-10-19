import apiFetch from '@wordpress/api-fetch';
import { Button } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
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
	const isCurrentPostPublished = useSelect( ( select ) =>
		select( 'core/editor' ).isCurrentPostPublished()
	);
	const isCurrentPostPublishedRef = useRef( isCurrentPostPublished );
	const [ hasNeverPublishedPost, setHasNeverPublishedPost ] = useState( false );
	const [ isOpen, setIsOpen ] = useState( false );
	const closeModal = () => setIsOpen( false );

	useEffect( () => {
		apiFetch( { path: '/wpcom/v2/site-has-never-published-post' } ).then( ( result ) => {
			setHasNeverPublishedPost( !! result );
		} );
	}, [] );

	useEffect( () => {
		// If the user never published any post before and the current post status changed to publish,
		// open the post publish modal
		if ( hasNeverPublishedPost && ! isCurrentPostPublishedRef.current && isCurrentPostPublished ) {
			isCurrentPostPublishedRef.current = isCurrentPostPublished;
			setHasNeverPublishedPost( false );

			// When the post published panel shows, it is focused automatically.
			// Thus, we need to delay open the modal so that the modal would not be close immediately
			// because the outside of modal is focused
			window.setTimeout( () => {
				setIsOpen( true );
			} );
		}
	}, [ hasNeverPublishedPost, isCurrentPostPublished ] );

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
				<Button variant="primary" href={ link }>
					{ __( 'View Post', 'full-site-editing' ) }
				</Button>
			}
			onClose={ closeModal }
		/>
	);
};

export default PostPublishedModal;
