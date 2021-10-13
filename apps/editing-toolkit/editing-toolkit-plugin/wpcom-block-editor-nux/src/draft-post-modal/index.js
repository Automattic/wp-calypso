import { Modal, Button } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { doAction } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import draftPostImage from './images/draft-post.svg';
import './style.scss';

const DraftPostModal = () => {
	const [ isOpen, setIsOpen ] = useState( true );
	const closeModal = () => setIsOpen( false );
	const closeEditor = () => doAction( 'a8c.wpcom-block-editor.closeEditor' );

	if ( ! isOpen ) {
		return null;
	}

	return (
		<Modal
			open={ isOpen }
			className="wpcom-block-editor-draft-post-modal"
			onRequestClose={ closeModal }
		>
			<div className="wpcom-block-editor-draft-post-modal__image-container">
				<img src={ draftPostImage } alt={ __( 'Write post', 'full-site-editing' ) } />
			</div>
			<h1 className="wpcom-block-editor-draft-post-modal__title">
				{ __( 'Write your first post', 'full-site-editing' ) }
			</h1>
			<p className="wpcom-block-editor-draft-post-modal__description">
				{ __(
					'It’s time to flex those writing muscles and start drafting your first post!',
					'full-site-editing'
				) }
			</p>
			<div className="wpcom-block-editor-draft-post-modal__buttons" justify="center">
				<Button variant="primary" onClick={ closeModal }>
					{ __( 'Start writing', 'full-site-editing' ) }
				</Button>
				<Button variant="secondary" onClick={ closeEditor }>
					{ __( "I'm not ready", 'full-site-editing' ) }
				</Button>
			</div>
		</Modal>
	);
};

export default DraftPostModal;
