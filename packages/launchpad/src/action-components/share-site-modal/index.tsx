import { Popover } from '@automattic/components';
import { updateLaunchpadSettings } from '@automattic/data-stores';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Modal } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, link, share } from '@wordpress/icons';
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
			href: `${ encodeURIComponent( encodedSiteUrl ) }&text=${ encodedText }`,
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

// @TODO add click events for social network to ensure tracking, then open in new window.
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

	const copyHandler = async () => {
		navigator.clipboard.writeText( shareData.url );
		if ( shareData.title ) {
			await updateLaunchpadSettings( shareData.title, {
				checklist_statuses: { share_site: true },
			} );
		}
		queryClient.invalidateQueries( { queryKey: [ 'launchpad' ] } );
		setClipboardCopied( true );
		setTimeout( () => setClipboardCopied( false ), 3000 );
	};

	const webShareClickHandler = async () => {
		if ( ! canUseWebShare ) {
			return;
		}
		await navigator.share( shareData );
	};

	return (
		<>
			<Modal
				onRequestClose={ () => setModalIsOpen( false ) }
				className="share-site-modal__modal"
				title=""
			>
				<div className="share-site-modal__modal-content">
					<div className="share-site-modal__modal-text">
						<h1 className="share-site-modal__modal-heading">
							{ __( 'Share your site', 'launchpad' ) }
						</h1>
					</div>
					<div className="share-site-modal__modal-actions">
						<div className="share-site-modal__modal-site">
							<div className="share-site-modal__modal-domain">
								<p className="share-site-modal__modal-domain-text" ref={ clipboardTextEl }>
									{ shareData.title }
								</p>

								<Popover
									className="share-site-modal__popover"
									isVisible={ clipboardCopied }
									context={ clipboardTextEl.current }
									position="top"
								>
									{ __( 'Copied to clipboard!', 'launchpad' ) }
								</Popover>
							</div>

							<div>
								<Button
									onClick={ copyHandler }
									className="share-site-modal__modal-copy-link"
									disabled={ ! shareData.title }
								>
									<Icon icon={ link } size={ 22 } />
									<span className="share-site-modal__modal-view-site-text">
										{ __( 'Copy', 'launchpad' ) }
									</span>
								</Button>
								{ canUseWebShare && (
									<Button
										className="share-site-modal__modal-copy-link"
										onClick={ webShareClickHandler }
									>
										<Icon icon={ share } size={ 22 } />
										<span className="share-site-modal__modal-view-site-text">
											{ __( 'Share', 'launchpad' ) }
										</span>
									</Button>
								) }
							</div>
						</div>
						<div className="share-site-modal__modal-social">
							{ getShareLinks( shareData.url, shareData.text ).map(
								( { href, className, title, icon, label }, index ) => (
									<a
										key={ index }
										href={ href }
										className={ className }
										title={ title }
										rel="noopener noreferrer"
										target="_blank"
									>
										<SocialLogo
											className="share-site-modal__modal-icon"
											size={ 24 }
											icon={ icon }
										/>
										<span>{ label }</span>
									</a>
								)
							) }
						</div>
					</div>
				</div>
			</Modal>
		</>
	);
};

export default ShareSiteModal;
