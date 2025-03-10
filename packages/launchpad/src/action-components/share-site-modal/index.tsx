import { Popover } from '@automattic/components';
import { updateLaunchpadSettings } from '@automattic/data-stores';
import { useQueryClient } from '@tanstack/react-query';
import {
	Button,
	Modal,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { link, share, check } from '@wordpress/icons';
import { useState, useRef } from 'react';
import { SocialLogo } from 'social-logos';
import type { SiteDetails } from '@automattic/data-stores';

import './style.scss';

interface ShareSiteModalProps {
	setModalIsOpen: ( isOpen: boolean ) => void;
	site: SiteDetails | null;
}

interface ShareLink {
	href: string;
	className: string;
	title: string;
	icon: 'mail' | 'tumblr' | 'bluesky' | 'linkedin' | 'telegram' | 'reddit' | 'whatsapp' | 'x';
	label: string;
}

const getShareLinks = ( siteUrl: string, text: string ): ShareLink[] => {
	const encodedSiteUrl = encodeURIComponent( siteUrl );
	const encodedText = encodeURIComponent( text );
	return [
		{
			href: `mailto:?subject=${ encodedText }&body=${ encodedSiteUrl }`,
			className: 'share-site-modal__modal-share-link',
			title: __( 'Share via email', 'launchpad' ),
			icon: 'mail',
			label: __( 'Email', 'launchpad' ),
		},
		{
			href: `http://www.tumblr.com/share/link?url=${ encodedSiteUrl }`,
			className: 'share-site-modal__modal-share-link',
			title: __( 'Share on Tumblr', 'launchpad' ),
			icon: 'tumblr',
			label: __( 'Tumblr', 'launchpad' ),
		},
		{
			href: `https://bsky.app/intent/compose?text=${ encodedSiteUrl }`,
			className: 'share-site-modal__modal-share-link',
			title: __( 'Share on Bluesky', 'launchpad' ),
			icon: 'bluesky',
			label: __( 'Bluesky', 'launchpad' ),
		},
		{
			href: `https://www.linkedin.com/shareArticle?mini=true&url=${ encodedSiteUrl }&title=${ encodedText }`,
			className: 'share-site-modal__modal-share-link',
			title: __( 'Share on LinkedIn', 'launchpad' ),
			icon: 'linkedin',
			label: __( 'LinkedIn', 'launchpad' ),
		},
		{
			href: `https://t.me/share/url?url=${ encodeURIComponent(
				encodedSiteUrl
			) }&text=${ encodedText }`,
			className: 'share-site-modal__modal-share-link',
			title: __( 'Share on Telegram', 'launchpad' ),
			icon: 'telegram',
			label: __( 'Telegram', 'launchpad' ),
		},
		{
			href: `http://www.reddit.com/submit?url=${ encodedSiteUrl }&title=${ encodedText }`,
			className: 'share-site-modal__modal-share-link',
			title: __( 'Share on Reddit', 'launchpad' ),
			icon: 'reddit',
			label: __( 'Reddit', 'launchpad' ),
		},
		{
			href: `https://api.whatsapp.com/send?text=${ encodedSiteUrl }`,
			className: 'share-site-modal__modal-share-link',
			title: __( 'Share on WhatsApp', 'launchpad' ),
			icon: 'whatsapp',
			label: __( 'WhatsApp', 'launchpad' ),
		},
		{
			href: `https://x.com/intent/post?url=${ encodedSiteUrl }&text=${ encodedText }`,
			className: 'share-site-modal__modal-share-link',
			title: __( 'Share on X', 'launchpad' ),
			icon: 'x',
			label: __( 'X', 'launchpad' ),
		},
	];
};

const ShareSiteModal = ( { setModalIsOpen, site }: ShareSiteModalProps ) => {
	const queryClient = useQueryClient();
	const getSiteSlug = ( site: SiteDetails | null ) => {
		if ( ! site ) {
			return '';
		}

		if ( site.slug ) {
			return site.slug;
		}

		if ( site.URL ) {
			return new URL( site.URL ).host;
		}
		return '';
	};
	const siteSlug = getSiteSlug( site );
	const shareData = {
		title: siteSlug,
		text: sprintf(
			/* translators: siteSlug is the short form of the site URL with the https:// */
			__( 'Please visit my site: %(siteSlug)s', 'launchpad' ),
			{
				siteSlug,
			}
		),
		url: site?.URL || '',
	};
	const canUseWebShare = window.navigator?.canShare && window.navigator.canShare( shareData );

	const [ clipboardCopied, setClipboardCopied ] = useState( false );
	const clipboardTextEl = useRef( null );
	const trackShareClick = async () => {
		if ( shareData.title ) {
			await updateLaunchpadSettings( shareData.title, {
				checklist_statuses: { share_site: true },
			} );
		}
		queryClient.invalidateQueries( { queryKey: [ 'launchpad' ] } );
	};
	const copyHandler = async () => {
		navigator.clipboard.writeText( shareData.url );
		setClipboardCopied( true );
		trackShareClick();
		setTimeout( () => setClipboardCopied( false ), 3000 );
	};

	const webShareClickHandler = async () => {
		if ( ! canUseWebShare ) {
			return;
		}
		trackShareClick();
		await navigator.share( shareData );
	};

	const socialLinkClickHandler = ( event: React.MouseEvent< HTMLAnchorElement > ) => {
		event.preventDefault();
		trackShareClick();
		window.open( event.currentTarget.href, '_blank' );
	};

	return (
		<>
			<Modal
				onRequestClose={ () => setModalIsOpen( false ) }
				className="share-site-modal__modal"
				title={ __( 'Share your site', 'launchpad' ) }
			>
				<VStack className="share-site-modal__modal-content" spacing={ 4 }>
					<VStack className="share-site-modal__modal-actions" spacing={ 4 }>
						<HStack className="share-site-modal__modal-site">
							<div className="share-site-modal__modal-domain">
								<p className="share-site-modal__modal-domain-text" ref={ clipboardTextEl }>
									{ shareData.title }
								</p>
							</div>

							<HStack className="share-site-modal__modal-actions-buttons">
								<Button
									onClick={ copyHandler }
									className="share-site-modal__modal-copy-link"
									disabled={ ! shareData.title || clipboardCopied }
									icon={ clipboardCopied ? check : link }
								>
									<span className="share-site-modal__modal-view-site-text">
										{ __( 'Copy', 'launchpad' ) }
									</span>
								</Button>
								<Popover
									className="share-site-modal__popover"
									isVisible={ clipboardCopied }
									context={ clipboardTextEl.current }
									position="top"
								>
									{ __( 'Copied to clipboard!', 'launchpad' ) }
								</Popover>
								{ canUseWebShare && (
									<Button
										className="share-site-modal__modal-copy-link"
										onClick={ webShareClickHandler }
										icon={ share }
									>
										<span className="share-site-modal__modal-view-site-text">
											{ __( 'Share', 'launchpad' ) }
										</span>
									</Button>
								) }
							</HStack>
						</HStack>
						<HStack className="share-site-modal__modal-social" as="ul" justify="start">
							{ getShareLinks( shareData.url, shareData.text ).map(
								( { href, className, title, icon, label }, index ) => (
									<li key={ index }>
										<a
											href={ href }
											className={ className }
											title={ title }
											rel="noopener noreferrer"
											target="_blank"
											onClick={ socialLinkClickHandler }
										>
											<SocialLogo
												className="share-site-modal__modal-icon"
												size={ 24 }
												icon={ icon }
											/>
											<span>{ label }</span>
										</a>
									</li>
								)
							) }
						</HStack>
					</VStack>
				</VStack>
			</Modal>
		</>
	);
};

export default ShareSiteModal;
