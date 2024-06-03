import { recordTracksEvent } from '@automattic/calypso-analytics';
import { FormLabel } from '@automattic/components';
import { START_WRITING_FLOW, DESIGN_FIRST_FLOW } from '@automattic/onboarding';
import { Modal, Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useRef, useState } from '@wordpress/element';
import { Icon, globe, link as linkIcon } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import React from 'react';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import { useShouldShowFirstPostPublishedModal } from '../../../dotcom-fse/lib/first-post-published-modal/should-show-first-post-published-modal-context';
import useShouldShowSellerCelebrationModal from '../../../dotcom-fse/lib/seller-celebration-modal/use-should-show-seller-celebration-modal';
import useSiteIntent from '../../../dotcom-fse/lib/site-intent/use-site-intent';
import useShouldShowVideoCelebrationModal from '../../../dotcom-fse/lib/video-celebration-modal/use-should-show-video-celebration-modal';
import postPublishedImage from './images/illo-share.svg';
import InlineSocialLogo from './inline-social-logo';
import InlineSocialLogosSprite from './inline-social-logos-sprite';
import SuggestedTags from './suggested-tags';
import useSharingModalDismissed from './use-sharing-modal-dismissed';

import './style.scss';

type CoreEditorPlaceholder = {
	getCurrentPost: ( ...args: unknown[] ) => {
		link: string;
		title: string;
		status: string;
		password: string;
	};
	getCurrentPostType: ( ...args: unknown[] ) => string;
	isCurrentPostPublished: ( ...args: unknown[] ) => boolean;
};
const FB_APP_ID = '249643311490';

const SharingModalInner: React.FC = () => {
	const isDismissedDefault = window?.sharingModalOptions?.isDismissed || false;
	const { launchpadScreenOption } = window?.launchpadOptions || {};
	const { isDismissed, updateIsDismissed } = useSharingModalDismissed( isDismissedDefault );
	const { __ } = useI18n();
	const isPrivateBlog = window?.wpcomGutenberg?.blogPublic === '-1';

	const {
		link,
		title,
		status: postStatus,
		password: postPassword,
	} = useSelect(
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
	const shouldShowSellerCelebrationModal = useShouldShowSellerCelebrationModal();
	const shouldShowVideoCelebrationModal =
		useShouldShowVideoCelebrationModal( isCurrentPostPublished );

	const [ isOpen, setIsOpen ] = useState( false );
	const closeModal = () => setIsOpen( false );
	const { createNotice } = useDispatch( noticesStore );
	const [ shouldShowSuggestedTags, setShouldShowSuggestedTags ] = React.useState( true );

	useEffect( () => {
		// The first post will show a different modal.
		if (
			! shouldShowFirstPostPublishedModal &&
			! shouldShowSellerCelebrationModal &&
			! shouldShowVideoCelebrationModal &&
			launchpadScreenOption !== 'full' &&
			! previousIsCurrentPostPublished.current &&
			isCurrentPostPublished &&
			// Ensure post is published publicly and not private or password protected.
			postStatus === 'publish' &&
			! postPassword &&
			postType === 'post'
		) {
			previousIsCurrentPostPublished.current = isCurrentPostPublished;
			recordTracksEvent( 'calypso_editor_sharing_dialog_show' );

			// When the post published panel shows, it is focused automatically.
			// Thus, we need to delay open the modal so that the modal would not be close immediately
			// because the outside of modal is focused
			window.setTimeout( () => {
				setIsOpen( true );
			} );
		}
	}, [
		postType,
		shouldShowFirstPostPublishedModal,
		shouldShowSellerCelebrationModal,
		shouldShowVideoCelebrationModal,
		isCurrentPostPublished,
		launchpadScreenOption,
	] );

	if ( ! isOpen || isDismissedDefault || isPrivateBlog ) {
		return null;
	}

	const shareTwitter = () => {
		const baseUrl = new URL( 'https://twitter.com/intent/tweet' );
		const params = new URLSearchParams( {
			text: title,
			url: link,
		} );
		baseUrl.search = params.toString();
		const twitterUrl = baseUrl.href;

		recordTracksEvent( 'calypso_editor_sharing_twitter' );
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

		recordTracksEvent( 'calypso_editor_sharing_facebook' );
		window.open( facebookUrl, 'facebook', 'width=626,height=436,resizeable,scrollbars' );
	};
	const shareLinkedin = () => {
		const baseUrl = new URL( 'https://www.linkedin.com/shareArticle' );
		const params = new URLSearchParams( {
			title,
			url: link,
		} );
		baseUrl.search = params.toString();
		const linkedinUrl = baseUrl.href;

		recordTracksEvent( 'calypso_editor_sharing_linkedin' );
		window.open( linkedinUrl, 'linkedin', 'width=626,height=436,resizeable,scrollbars' );
	};
	const shareTumblr = () => {
		const baseUrl = new URL( 'https://www.tumblr.com/widgets/share/tool' );
		const params = new URLSearchParams( {
			canonicalUrl: link,
			title: title,
		} );
		baseUrl.search = params.toString();
		const tumblrUrl = baseUrl.href;

		recordTracksEvent( 'calypso_editor_sharing_tumblr' );
		window.open( tumblrUrl, 'tumblr', 'width=626,height=436,resizeable,scrollbars' );
	};
	const sharePinterest = () => {
		const baseUrl = new URL( 'https://pinterest.com/pin/create/button/' );
		const params = new URLSearchParams( {
			url: link,
			description: title,
		} );
		baseUrl.search = params.toString();
		const pinterestUrl = baseUrl.href;

		recordTracksEvent( 'calypso_editor_sharing_pinterest' );
		window.open( pinterestUrl, 'pinterest', 'width=626,height=436,resizeable,scrollbars' );
	};
	const copyLinkClick = () => {
		recordTracksEvent( 'calypso_editor_sharing_link_copy' );
		createNotice( 'success', __( 'Link copied to clipboard.', 'full-site-editing' ), {
			type: 'snackbar',
		} );
	};
	return (
		<Modal
			className="wpcom-block-editor-post-published-sharing-modal"
			title=""
			onRequestClose={ closeModal }
		>
			<InlineSocialLogosSprite />
			<div className="wpcom-block-editor-post-published-sharing-modal__inner">
				<div className="wpcom-block-editor-post-published-sharing-modal__left">
					<h1> { __( 'Post published!', 'full-site-editing' ) } </h1>
					<div className="wpcom-block-editor-post-published-buttons">
						<a
							href={ link }
							className="link-button wpcom-block-editor-post-published-sharing-modal__view-post-link"
							rel="external"
						>
							{ ' ' }
							<Icon icon={ globe } /> { __( 'View Post', 'full-site-editing' ) }
						</a>
						<ClipboardButton
							text={ link }
							className="components-button link-button"
							onCopy={ copyLinkClick }
						>
							<Icon icon={ linkIcon } /> { __( 'Copy Link', 'full-site-editing' ) }
						</ClipboardButton>
					</div>
					<hr />
					<h2>{ __( 'Get more traffic to your post by sharing:', 'full-site-editing' ) }</h2>
					<Button
						className={ clsx(
							'wpcom-block-editor-post-published-sharing-modal__sharing-button',
							'share-facebook'
						) }
						onClick={ shareFb }
					>
						<InlineSocialLogo icon="facebook" size={ 18 } />
					</Button>
					<Button
						className={ clsx(
							'wpcom-block-editor-post-published-sharing-modal__sharing-button',
							'share-twitter'
						) }
						onClick={ shareTwitter }
					>
						<InlineSocialLogo icon="twitter-alt" size={ 18 } />
					</Button>
					<Button
						className={ clsx(
							'wpcom-block-editor-post-published-sharing-modal__sharing-button',
							'share-linkedin'
						) }
						onClick={ shareLinkedin }
					>
						<InlineSocialLogo icon="linkedin" size={ 18 } />
					</Button>
					<Button
						className={ clsx(
							'wpcom-block-editor-post-published-sharing-modal__sharing-button',
							'share-tumblr'
						) }
						onClick={ shareTumblr }
					>
						<InlineSocialLogo icon="tumblr-alt" size={ 18 } />
					</Button>
					<Button
						className={ clsx(
							'wpcom-block-editor-post-published-sharing-modal__sharing-button',
							'share-pinterest'
						) }
						onClick={ sharePinterest }
					>
						<InlineSocialLogo icon="pinterest-alt" size={ 18 } />
					</Button>
					<div className="wpcom-block-editor-post-published-sharing-modal__checkbox-section">
						<FormLabel htmlFor="toggle" className="is-checkbox">
							<FormInputCheckbox
								id="toggle"
								onChange={ () => {
									updateIsDismissed( ! isDismissed );
								} }
							/>
							<span>{ __( "Don't show again", 'full-site-editing' ) }</span>
						</FormLabel>
					</div>
				</div>
				<div className="wpcom-block-editor-post-published-sharing-modal__right">
					{ shouldShowSuggestedTags ? (
						<SuggestedTags setShouldShowSuggestedTags={ setShouldShowSuggestedTags } />
					) : (
						<img
							className="wpcom-block-editor-post-published-sharing-modal__image"
							src={ postPublishedImage }
							alt={ __( 'Share Post', 'full-site-editing' ) }
						/>
					) }
				</div>
			</div>
		</Modal>
	);
};

const SharingModal = () => {
	const { siteIntent: intent } = useSiteIntent();
	if ( intent === START_WRITING_FLOW || intent === DESIGN_FIRST_FLOW ) {
		return null;
	}
	return <SharingModalInner />;
};
export default SharingModal;
