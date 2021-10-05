import { Modal, Button, Flex, FlexItem } from '@wordpress/components';
import { doAction } from '@wordpress/hooks';
import { useI18n } from '@wordpress/react-i18n';
import React from 'react';
import draftPostImage from './images/draft-post.svg';
import './style.scss';

const DraftPostModal = () => {
	const { __ } = useI18n();
	const [ isOpen, setIsOpen ] = React.useState( true );
	const closeModal = () => setIsOpen( false );
	const closeEditor = () => doAction( 'a8c.wpcom-block-editor.closeEditor' );

	React.useEffect( () => {
		window.sessionStorage.removeItem( 'wpcom_signup_complete_show_draft_post_modal' );
	}, [] );

	return (
		<Modal
			open={ isOpen }
			className="wpcom-block-editor-draft-post-modal"
			onRequestClose={ closeModal }
		>
			<img src={ draftPostImage } alt={ __( 'Draft post', 'full-site-editing' ) } />
			<h1 className="wpcom-block-editor-draft-post-modal__title">
				{ __( 'Draft your first post', 'full-site-editing' ) }
			</h1>
			<p className="wpcom-block-editor-draft-post-modal__description">
				{ __(
					'It’s time to flex those writing muscles and start drafting your first post!',
					'full-site-editing'
				) }
			</p>
			<Flex className="wpcom-block-editor-draft-post-modal__buttons" justify="center" gap={ 4 }>
				<FlexItem>
					<Button variant="primary" onClick={ closeModal }>
						{ __( 'Start writing', 'full-site-editing' ) }
					</Button>
				</FlexItem>
				<FlexItem>
					<Button variant="secondary" onClick={ closeEditor }>
						{ __( "I'm not ready", 'full-site-editing' ) }
					</Button>
				</FlexItem>
			</Flex>
		</Modal>
	);
};

export default DraftPostModal;
