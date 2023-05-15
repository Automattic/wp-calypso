import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Modal, Button, ExternalLink } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useRef, useState, createInterpolateElement } from '@wordpress/element';
import { Icon, globe, link as linkIcon } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import React from 'react';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import FormLabel from 'calypso/components/forms/form-label';
import SocialLogo from 'calypso/components/social-logo';
import { useShouldShowFirstPostPublishedModal } from '../../../dotcom-fse/lib/first-post-published-modal/should-show-first-post-published-modal-context';
import useShouldShowSellerCelebrationModal from '../../../dotcom-fse/lib/seller-celebration-modal/use-should-show-seller-celebration-modal';
import useShouldShowVideoCelebrationModal from '../../../dotcom-fse/lib/video-celebration-modal/use-should-show-video-celebration-modal';
import postPublishedImage from './images/illo-share.svg';
import useSharingModalDismissed from './use-sharing-modal-dismissed';
import './style.scss';

type CoreEditorPlaceholder = {
	getCurrentPost: ( ...args: unknown[] ) => { link: string; title: string };
	getCurrentPostType: ( ...args: unknown[] ) => string;
	isCurrentPostPublished: ( ...args: unknown[] ) => boolean;
};
const FB_APP_ID = '249643311490';

const SharingModal: React.FC = () => {
	const isDismissedDefault = window?.sharingModalOptions?.isDismissed || false;
	const { launchpadScreenOption } = window?.launchpadOptions || {};
	const { isDismissed, updateIsDismissed } = useSharingModalDismissed( isDismissedDefault );
	const { __ } = useI18n();

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
	const shouldShowFirstPostPublishedModal = useShouldShowFirstPostPublishedModal();
	const shouldShowSellerCelebrationModal = useShouldShowSellerCelebrationModal();
	const shouldShowVideoCelebrationModal =
		useShouldShowVideoCelebrationModal( isCurrentPostPublished );

	const [ isOpen, setIsOpen ] = useState( false );
	const closeModal = () => setIsOpen( false );
	const { createNotice } = useDispatch( noticesStore );

	const siteSlug = window.location.hostname;
	const subscribersUrl = `https://wordpress.com/people/subscribers/${ siteSlug }`;

	useEffect( () => {
		// The first post will show a different modal.
		if (
			! shouldShowFirstPostPublishedModal &&
			! shouldShowSellerCelebrationModal &&
			! shouldShowVideoCelebrationModal &&
			launchpadScreenOption !== 'full' &&
			! previousIsCurrentPostPublished.current &&
			isCurrentPostPublished &&
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
	const trackSubscribersClick = () => {
		recordTracksEvent( 'calypso_editor_sharing_view_subscribers' );
	};

	if ( ! isOpen || isDismissedDefault ) {
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
					<h1> { __( 'Post published!', 'full-site-editing' ) } </h1>
					<p>
						{ createInterpolateElement(
							__(
								'Your post is now live and was delivered to each of <a>your subscribers</a>.',
								'full-site-editing'
							),
							{
								a: (
									<ExternalLink
										href={ subscribersUrl }
										onClick={ trackSubscribersClick }
										target="_blank"
									/>
								),
							}
						) }
					</p>
					<div className="wpcom-block-editor-post-published-buttons">
						<a href={ link } className="link-button" rel="external">
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
						<SocialLogo icon="twitter-alt" size={ 18 } />
					</Button>
					<Button
						className={ classnames(
							'wpcom-block-editor-post-published-sharing-modal__sharing-button',
							'share-linkedin'
						) }
						onClick={ shareLinkedin }
					>
						<SocialLogo icon="linkedin" size={ 18 } />
					</Button>
					<Button
						className={ classnames(
							'wpcom-block-editor-post-published-sharing-modal__sharing-button',
							'share-tumblr'
						) }
						onClick={ shareTumblr }
					>
						<SocialLogo icon="tumblr-alt" size={ 18 } />
					</Button>
					<Button
						className={ classnames(
							'wpcom-block-editor-post-published-sharing-modal__sharing-button',
							'share-pinterest'
						) }
						onClick={ sharePinterest }
					>
						<SocialLogo icon="pinterest-alt" size={ 18 } />
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

export default SharingModal;
