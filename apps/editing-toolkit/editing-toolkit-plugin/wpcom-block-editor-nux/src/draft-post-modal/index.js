import { Button } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { doAction } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import NuxModal from '../nux-modal';
import './style.scss';

const DraftPostModal = () => {
	const [ isOpen, setIsOpen ] = useState( true );
	const closeModal = () => setIsOpen( false );
	const closeEditor = () => doAction( 'a8c.wpcom-block-editor.closeEditor' );

	return (
		<NuxModal
			isOpen={ isOpen }
			className="wpcom-block-editor-draft-post-modal"
			title={ __( 'Write your first post', 'full-site-editing' ) }
			description={ __(
				'It’s time to flex those writing muscles and start drafting your first post!',
				'full-site-editing'
			) }
			actionButtons={
				<>
					<Button isPrimary onClick={ closeModal }>
						{ __( 'Start writing', 'full-site-editing' ) }
					</Button>
					<Button isSecondary onClick={ closeEditor }>
						{ __( "I'm not ready", 'full-site-editing' ) }
					</Button>
				</>
			}
			onRequestClose={ closeModal }
		/>
	);
};

export default DraftPostModal;
