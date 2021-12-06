import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { doAction, hasAction } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import NuxModal from '../nux-modal';
import draftPostImage from './images/draft-post.svg';
import './style.scss';

const CLOSE_EDITOR_ACTION = 'a8c.wpcom-block-editor.closeEditor';

const DraftPostModal = () => {
	const siteId = window._currentSiteId;
	const primaryDomain = useSelect( ( select ) =>
		select( 'automattic/site' ).getPrimarySiteDomain( siteId )
	);

	const homeUrl = `/home/${ primaryDomain?.domain || window.location.hostname }`;
	const [ isOpen, setIsOpen ] = useState( true );
	const closeModal = () => setIsOpen( false );
	const closeEditor = () => {
		if ( hasAction( CLOSE_EDITOR_ACTION ) ) {
			doAction( CLOSE_EDITOR_ACTION, homeUrl );
		} else {
			window.location.href = `https://wordpress.com${ homeUrl }`;
		}
	};

	return (
		<NuxModal
			isOpen={ isOpen }
			className="wpcom-block-editor-draft-post-modal"
			title={ __( 'Write your first post', 'full-site-editing' ) }
			description={ __(
				'It’s time to flex those writing muscles and start drafting your first post!',
				'full-site-editing'
			) }
			imageSrc={ draftPostImage }
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
			onOpen={ () => recordTracksEvent( 'calypso_editor_wpcom_draft_post_modal_show' ) }
		/>
	);
};

export default DraftPostModal;
