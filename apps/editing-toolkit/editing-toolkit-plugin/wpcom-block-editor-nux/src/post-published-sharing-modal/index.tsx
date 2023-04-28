import { Modal, Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Icon, globe, link as linkIcon } from '@wordpress/icons';
import classnames from 'classnames';
import React from 'react';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import SocialLogo from 'calypso/components/social-logo';
import { selectors as wpcomWelcomeGuideSelectors } from '../store';
import postPublishedImage from './images/illo-share.svg';
import type { SelectFromMap } from '@automattic/data-stores';
import './style.scss';

type WpcomWelcomeGuideSelectors = SelectFromMap< typeof wpcomWelcomeGuideSelectors >;
type CoreEditorPlaceholder = {
	getCurrentPost: ( ...args: unknown[] ) => { link: string; title: string };
	getCurrentPostType: ( ...args: unknown[] ) => string;
	isCurrentPostPublished: ( ...args: unknown[] ) => boolean;
};
// todo: check this is correct
const FB_APP_ID = '249643311490';

const PostPublishedSharingModal: React.FC = () => {
	const { link, title } = useSelect(
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
	const shouldShowFirstPostPublishedModal = useSelect(
		( select ) =>
			(
				select( 'automattic/wpcom-welcome-guide' ) as WpcomWelcomeGuideSelectors
			 ).getShouldShowFirstPostPublishedModal(),
		[]
	);
	const [ isOpen, setIsOpen ] = useState( true );
	const closeModal = () => setIsOpen( false );
	const { fetchShouldShowFirstPostPublishedModal } = useDispatch(
		'automattic/wpcom-welcome-guide'
	);
	// implementation coppied from ./client/blocks/reader-share/index.jsx
	const shareTwitter = () => {
		const baseUrl = new URL( 'https://twitter.com/intent/tweet' );
		const params = new URLSearchParams( {
			text: title,
			url: link,
		} );
		baseUrl.search = params.toString();

		const twitterUrl = baseUrl.href;

		window.open( twitterUrl, 'twitter', 'width=550,height=420,resizeable,scrollbars' );
	};
	const shareFb = () => {
		const baseUrl = new URL( 'https://www.facebook.com/sharer.php' );
		const params = new URLSearchParams( {
			u: link,
			app_id: FB_APP_ID,
		} );
		baseUrl.search = params.toString();

		const facebookUrl = baseUrl.href;

		window.open( facebookUrl, 'facebook', 'width=626,height=436,resizeable,scrollbars' );
	};

	useEffect( () => {
		fetchShouldShowFirstPostPublishedModal();
	}, [ fetchShouldShowFirstPostPublishedModal ] );
	useEffect( () => {
		// The first post will show a different modal.
		if (
			! shouldShowFirstPostPublishedModal &&
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

	const handleViewPostClick = () => {
		( window.top as Window ).location.href = link;
	};

	if ( ! isOpen ) {
		return null;
	}

	return (
		<Modal
			className="wpcom-block-editor-post-published-sharing-modal"
			open={ isOpen }
			title=""
			onRequestClose={ closeModal }
		>
			<div className="wpcom-block-editor-post-published-sharing-modal__inner">
				<div className="wpcom-block-editor-post-published-sharing-modal__left">
					<h1> { __( 'Congratulations!', 'full-site-editing' ) } </h1>
					<p>
						{ __(
							'Your post is now live and was delivered successfully to subscribed readers',
							'full-site-editing'
						) }
					</p>
					<Button onClick={ handleViewPostClick } className="link-button">
						{ ' ' }
						<Icon icon={ globe } /> { __( 'View Post', 'full-site-editing' ) }
					</Button>
					<ClipboardButton text={ link } className="components-button link-button">
						<Icon icon={ linkIcon } /> { __( 'Copy Link', 'full-site-editing' ) }
					</ClipboardButton>
					<hr />
					<h2>{ __( 'Share with:', 'full-site-editing' ) }</h2>
					<Button
						className={ classnames(
							'wpcom-block-editor-post-published-sharing-modal__sharing-button',
							'share-facebook'
						) }
						onClick={ shareFb }
					>
						<SocialLogo icon="facebook" size={ 18 } />
					</Button>
					<Button
						className={ classnames(
							'wpcom-block-editor-post-published-sharing-modal__sharing-button',
							'share-twitter'
						) }
						onClick={ shareTwitter }
					>
						<SocialLogo icon="twitter" size={ 18 } />
					</Button>
				</div>
				<div className="wpcom-block-editor-post-published-sharing-modal__right">
					<img
						className="wpcom-block-editor-post-published-sharing-modal__image"
						src={ postPublishedImage }
						alt={ __( 'Share Post', 'full-site-editing' ) }
					/>
				</div>
			</div>
		</Modal>
	);
};

export default PostPublishedSharingModal;
