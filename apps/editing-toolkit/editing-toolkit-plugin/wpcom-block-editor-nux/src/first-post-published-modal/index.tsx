import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { isURL } from '@wordpress/url';
import React from 'react';
import { useShouldShowFirstPostPublishedModal } from '../../../dotcom-fse/lib/first-post-published-modal/should-show-first-post-published-modal-context';
import NuxModal from '../nux-modal';
import postPublishedImage from './images/post-published.svg';

import './style.scss';

type CoreEditorPlaceholder = {
	getCurrentPost: ( ...args: unknown[] ) => { link: string };
	getCurrentPostType: ( ...args: unknown[] ) => string;
	isCurrentPostPublished: ( ...args: unknown[] ) => boolean;
};

/**
 * Show the first post publish modal
 */
const FirstPostPublishedModal: React.FC = () => {
	const { link } = useSelect(
		( select ) => ( select( 'core/editor' ) as CoreEditorPlaceholder ).getCurrentPost(),
		[]
	);
	const postType = useSelect(
		( select ) => ( select( 'core/editor' ) as CoreEditorPlaceholder ).getCurrentPostType(),
		[]
	);

	const isCurrentPostPublished = useSelect(
		( select ) => ( select( 'core/editor' ) as CoreEditorPlaceholder ).isCurrentPostPublished(),
		[]
	);
	const previousIsCurrentPostPublished = useRef( isCurrentPostPublished );
	const shouldShowFirstPostPublishedModal = useShouldShowFirstPostPublishedModal();
	const [ isOpen, setIsOpen ] = useState( false );
	const closeModal = () => setIsOpen( false );

	const { siteUrlOption, launchpadScreenOption, siteIntentOption } = window?.launchpadOptions || {};

	let siteUrl = '';
	if ( isURL( siteUrlOption ) ) {
		// https://mysite.wordpress.com/path becomes mysite.wordpress.com
		siteUrl = new URL( siteUrlOption ).hostname;
	}

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

			// When the post published panel shows, it is focused automatically.
			// Thus, we need to delay open the modal so that the modal would not be close immediately
			// because the outside of modal is focused
			window.setTimeout( () => {
				setIsOpen( true );
			} );
		}
	}, [ postType, shouldShowFirstPostPublishedModal, isCurrentPostPublished ] );

	const handleViewPostClick = ( event: React.MouseEvent ) => {
		event.preventDefault();
		( window.top as Window ).location.href = link;
	};

	const handleNextStepsClick = ( event: React.MouseEvent ) => {
		event.preventDefault();
		(
			window.top as Window
		 ).location.href = `https://wordpress.com/setup/write/launchpad?siteSlug=${ siteUrl }`;
	};
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
				<>
					<Button isPrimary onClick={ handleViewPostClick }>
						{ __( 'View Post', 'full-site-editing' ) }
					</Button>
					{ launchpadScreenOption === 'full' && siteIntentOption === 'write' && (
						<Button isSecondary onClick={ handleNextStepsClick }>
							{ __( 'Next Steps', 'full-site-editing' ) }
						</Button>
					) }
				</>
			}
			onRequestClose={ closeModal }
			onOpen={ () => recordTracksEvent( 'calypso_editor_wpcom_first_post_published_modal_show' ) }
		/>
	);
};

export default FirstPostPublishedModal;
