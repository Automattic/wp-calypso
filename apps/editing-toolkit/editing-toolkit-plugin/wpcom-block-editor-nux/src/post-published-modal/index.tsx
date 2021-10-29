import { Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import NuxModal from '../nux-modal';
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
	const siteHasNeverPublishedPost = useSelect( ( select ) =>
		select( 'automattic/wpcom-welcome-guide' ).getSiteHasNeverPublishedPost()
	);
	const [ isOpen, setIsOpen ] = useState( false );
	const closeModal = () => setIsOpen( false );
	const { fetchSiteHasNeverPublishedPost, setSiteHasNeverPublishedPost } = useDispatch(
		'automattic/wpcom-welcome-guide'
	);

	useEffect( () => {
		fetchSiteHasNeverPublishedPost();
	}, [ fetchSiteHasNeverPublishedPost ] );
	useEffect( () => {
		// If the user never published any post before and the current post status changed to publish,
		// open the post publish modal
		if (
			siteHasNeverPublishedPost &&
			! previousIsCurrentPostPublished.current &&
			isCurrentPostPublished &&
			postType === 'post'
		) {
			previousIsCurrentPostPublished.current = isCurrentPostPublished;
			setSiteHasNeverPublishedPost( false );

			// When the post published panel shows, it is focused automatically.
			// Thus, we need to delay open the modal so that the modal would not be close immediately
			// because the outside of modal is focused
			window.setTimeout( () => {
				setIsOpen( true );
			} );
		}
	}, [
		postType,
		siteHasNeverPublishedPost,
		isCurrentPostPublished,
		setSiteHasNeverPublishedPost,
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
