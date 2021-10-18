import { Button } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import NuxModal from '../nux-modal';
import postPublishedImage from './images/post-published.svg';
import './style.scss';

const PostPublishedModal: React.FC = () => {
	const { link } = useSelect( ( select ) => select( 'core/editor' ).getCurrentPost() );
	const isCurrentPostPublished = useSelect( ( select ) =>
		select( 'core/editor' ).isCurrentPostPublished()
	);
	const [ initialIsCurrentPostPublished ] = useState( isCurrentPostPublished );
	const [ isOpen, setIsOpen ] = useState( false );
	const closeModal = () => setIsOpen( false );

	useEffect( () => {
		if ( ! initialIsCurrentPostPublished && isCurrentPostPublished ) {
			setIsOpen( true );
		}
	}, [ initialIsCurrentPostPublished, isCurrentPostPublished ] );

	if ( ! isOpen ) {
		return null;
	}

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
