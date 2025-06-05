import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Popover } from '@automattic/components';
import { updateLaunchpadSettings } from '@automattic/data-stores';
import { useQueryClient } from '@tanstack/react-query';
import {
	Button,
	Modal,
	__experimentalInputControl as InputControl,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	IconType,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { copy, share, check } from '@wordpress/icons';
import { useState, useRef, useMemo, useCallback } from 'react';
import { SocialLogo } from 'social-logos';
import type { Task } from '../../types';
import type { SiteDetails } from '@automattic/data-stores';
import './style.scss';

interface ShareSiteModalProps {
	setModalIsOpen: ( isOpen: boolean ) => void;
	site: SiteDetails | null;
	task: Task | null;
}

interface BaseShareLink {
	className: string;
	label: string;
}

interface SocialShareLink extends BaseShareLink {
	type?: 'link';
	href: string;
	title: string;
	icon: 'mail' | 'tumblr' | 'bluesky' | 'linkedin' | 'telegram' | 'reddit' | 'whatsapp' | 'x';
}

interface WordPressShareLink extends BaseShareLink {
	type: 'button';
	icon: IconType;
	onClick: () => void;
}

type ShareLink = SocialShareLink | WordPressShareLink;

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
			href: `https://t.me/share/url?url=${ encodedSiteUrl }&text=${ encodedText }`,
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

const getShareData = ( site: SiteDetails | null ) => {
	const siteSlug = getSiteSlug( site );
	return {
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
};
const ShareSiteModal = ( { setModalIsOpen, site, task }: ShareSiteModalProps ) => {
	const queryClient = useQueryClient();
	const shareData = getShareData( site );

	const trackShareClick = useCallback(
		async ( eventType: string ) => {
			recordTracksEvent( 'calypso_subscribers_share_site', {
				type: eventType,
				context: task?.id ? `launchpad-task-${ task.id }` : null,
				site_url: shareData.url,
			} );
			if ( shareData.title ) {
				await updateLaunchpadSettings( shareData.title, {
					checklist_statuses: { share_site: true },
				} );
			}
			queryClient.invalidateQueries( { queryKey: [ 'launchpad' ] } );
		},
		[ shareData, queryClient, task?.id ]
	);

	const [ clipboardCopied, setClipboardCopied ] = useState( false );
	const clipboardTextEl = useRef( null );
	const copyHandler = () => {
		navigator.clipboard.writeText( shareData.url );
		setClipboardCopied( true );
		trackShareClick( 'copy' );
		setTimeout( () => setClipboardCopied( false ), 3000 );
	};

	const canUseWebShare = window.navigator?.canShare && window.navigator.canShare( shareData );
	const webShareClickHandler = useCallback( async () => {
		if ( ! canUseWebShare ) {
			return;
		}
		trackShareClick( 'web-share' );
		await navigator.share( shareData );
	}, [ canUseWebShare, shareData, trackShareClick ] );

	const socialLinkClickHandler = ( event: React.MouseEvent< HTMLAnchorElement > ) => {
		event.preventDefault();
		const eventType = event.currentTarget.dataset.eventType as string;
		trackShareClick( eventType );
		window.open( event.currentTarget.href, '_blank' );
	};

	const shareLinks = useMemo( () => {
		const _shareLinks: ShareLink[] = [
			{
				type: 'button',
				className: 'share-site-modal__modal-share-link',
				label: __( 'Share via device', 'launchpad' ),
				icon: share,
				onClick: webShareClickHandler,
			},
			...getShareLinks( shareData.url, shareData.text ),
		];
		return _shareLinks;
	}, [ shareData, webShareClickHandler ] );

	return (
		<Modal
			onRequestClose={ () => setModalIsOpen( false ) }
			className="share-site-modal__modal"
			title={ __( 'Share your site', 'launchpad' ) }
		>
			<VStack className="share-site-modal__modal-content" spacing={ 4 }>
				<VStack className="share-site-modal__modal-actions" spacing={ 4 }>
					<Popover
						className="share-site-modal__popover"
						isVisible={ clipboardCopied }
						context={ clipboardTextEl.current }
						position="top"
					>
						{ __( 'Copied to clipboard!', 'launchpad' ) }
					</Popover>
					<InputControl
						className="share-site-modal__modal-input-container"
						__next40pxDefaultSize
						value={ shareData.title }
						label={ __( 'Site URL', 'launchpad' ) }
						ref={ clipboardTextEl }
						readOnly
						hideLabelFromVision
						suffix={
							<Button
								onClick={ copyHandler }
								className="share-site-modal__modal-copy-link"
								disabled={ ! shareData.title || clipboardCopied }
								icon={ clipboardCopied ? check : copy }
								label={ __( 'Copy Site URL', 'launchpad' ) }
							/>
						}
					/>
					<HStack className="share-site-modal__modal-social" as="ul" justify="start">
						{ shareLinks.map( ( link, index ) => (
							<li key={ index }>
								{ link.type === 'button' ? (
									<Button className={ link.className } onClick={ link.onClick } icon={ link.icon }>
										{ link.label }
									</Button>
								) : (
									<Button
										href={ link.href }
										className={ link.className }
										label={ link.title }
										rel="noopener noreferrer"
										target="_blank"
										onClick={ socialLinkClickHandler }
										data-event-type={ link.icon }
									>
										<SocialLogo
											className="share-site-modal__modal-icon"
											size={ 24 }
											icon={ link.icon }
										/>
										<span>{ link.label }</span>
									</Button>
								) }
							</li>
						) ) }
					</HStack>
				</VStack>
			</VStack>
		</Modal>
	);
};

export default ShareSiteModal;
