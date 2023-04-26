import { Modal, Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Icon, globe, link as linkIcon } from '@wordpress/icons';
import React from 'react';
import { selectors as wpcomWelcomeGuideSelectors } from '../store';
import postPublishedImage from './images/illo-share.svg';
import type { SelectFromMap } from '@automattic/data-stores';

import './style.scss';

type WpcomWelcomeGuideSelectors = SelectFromMap< typeof wpcomWelcomeGuideSelectors >;
type CoreEditorPlaceholder = {
	getCurrentPost: ( ...args: unknown[] ) => { link: string };
	getCurrentPostType: ( ...args: unknown[] ) => string;
	isCurrentPostPublished: ( ...args: unknown[] ) => boolean;
};

const PostPublishedSharingModal: React.FC = () => {
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
	const shouldShowFirstPostPublishedModal = useSelect(
		( select ) =>
			(
				select( 'automattic/wpcom-welcome-guide' ) as WpcomWelcomeGuideSelectors
			 ).getShouldShowFirstPostPublishedModal(),
		[]
	);
	const [ isOpen, setIsOpen ] = useState( false );
	const closeModal = () => setIsOpen( false );
	const { fetchShouldShowFirstPostPublishedModal } = useDispatch(
		'automattic/wpcom-welcome-guide'
	);

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

	const handleViewPostClick = ( event: React.MouseEvent ) => {
		event.preventDefault();
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
					<Button onClick={ handleViewPostClick }>
						{ ' ' }
						<Icon icon={ globe } /> { __( 'View Post', 'full-site-editing' ) }
					</Button>
					<Button onClick={ () => null }>
						{ ' ' }
						<Icon icon={ linkIcon } /> { __( 'View Post', 'full-site-editing' ) }
					</Button>
					<hr />
					<h2>{ __( 'Share with:', 'full-site-editing' ) }</h2>
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
