import { Popover } from '@automattic/components';
import { updateLaunchpadSettings } from '@automattic/data-stores';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, link } from '@wordpress/icons';
import { useState, useRef } from 'react';
import SocialLogo from 'calypso/components/social-logo';
import type { SiteDetails } from '@automattic/data-stores';

import './style.scss';

interface ShareSiteModalProps {
	setModalIsOpen: ( isOpen: boolean ) => void;
	site: SiteDetails | null;
}

// @TODO: build and use this list to generate links. Get site title.
const shareLinkNetworks = [
	{
		icon: 'tumblr',
		url: `http://www.reddit.com/submit?url=%%SITE_URL%%&title=%%SITE_TITLE%%`,
		label: __( 'Tumblr', 'launchpad' ),
	},
];

// @TODO: consider making the slug text use https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API
// @TODO add click events for social network to ensure tracking, then open in new window.
const ShareSiteModal = ( { setModalIsOpen, site }: ShareSiteModalProps ) => {
	const queryClient = useQueryClient();
	const getSiteSlug = ( site: SiteDetails | null ): string | null => {
		if ( ! site ) {
			return null;
		}

		if ( site.slug ) {
			return site.slug;
		}

		if ( site.URL ) {
			return new URL( site.URL ).host;
		}
		return null;
	};
	const siteSlug = getSiteSlug( site );

	const [ clipboardCopied, setClipboardCopied ] = useState( false );
	const clipboardTextEl = useRef( null );

	const copyHandler = async () => {
		navigator.clipboard.writeText( `https://${ siteSlug }` );
		/*
		if ( siteSlug ) {
			await updateLaunchpadSettings( siteSlug, {
				checklist_statuses: { share_site: true },
			} );
		}
		queryClient.invalidateQueries( { queryKey: [ 'launchpad' ] } );
	*/
		setClipboardCopied( true );
		setTimeout( () => setClipboardCopied( false ), 3000 );
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
						<p className="share-site-modal__modal-body">
							{ __(
								'Copy your site link below or select a network to share your site.',
								'launchpad'
							) }
						</p>
					</div>
					<div className="share-site-modal__modal-actions">
						<div className="share-site-modal__modal-site">
							<div className="share-site-modal__modal-domain">
								<p className="share-site-modal__modal-domain-text" ref={ clipboardTextEl }>
									{ siteSlug }
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

							<Button
								onClick={ copyHandler }
								className="share-site-modal__modal-copy-link"
								disabled={ ! siteSlug }
							>
								<Icon icon={ link } size={ 22 } />
								<span className="share-site-modal__modal-view-site-text">
									{ __( 'Copy', 'launchpad' ) }
								</span>
							</Button>
						</div>
						<div className="share-site-modal__modal-social">
							<a
								href="https://wordpress.com"
								className="share-site-modal__modal-share-link"
								title={ __( 'Share via email', 'launchpad' ) }
							>
								<SocialLogo className="share-site-modal__modal-icon" size={ 24 } icon="mail" />
								<span>{ __( 'Email', 'launchpad' ) }</span>
							</a>
							<a
								href="https://wordpress.com"
								className="share-site-modal__modal-share-link"
								title={ __( 'Share on WordPress', 'launchpad' ) }
							>
								<SocialLogo className="share-site-modal__modal-icon" size={ 24 } icon="wordpress" />
								<span>{ __( 'WordPress', 'launchpad' ) }</span>
							</a>
							<a
								href="https://wordpress.com"
								className="share-site-modal__modal-share-link"
								title={ __( 'Share on Tumblr', 'launchpad' ) }
							>
								<SocialLogo className="share-site-modal__modal-icon" size={ 24 } icon="tumblr" />
								<span>{ __( 'Tumblr', 'launchpad' ) }</span>
							</a>
							<a
								href="https://wordpress.com"
								className="share-site-modal__modal-share-link"
								title={ __( 'Share on Bluesky', 'launchpad' ) }
							>
								<SocialLogo className="share-site-modal__modal-icon" size={ 24 } icon="bluesky" />
								<span>{ __( 'Bluesky', 'launchpad' ) }</span>
							</a>
							<a
								href="https://wordpress.com"
								className="share-site-modal__modal-share-link"
								title={ __( 'Share on Instagram', 'launchpad' ) }
							>
								<SocialLogo className="share-site-modal__modal-icon" size={ 24 } icon="instagram" />
								<span>{ __( 'Instagram', 'launchpad' ) }</span>
							</a>
							<a
								href="https://wordpress.com"
								className="share-site-modal__modal-share-link"
								title={ __( 'Share on LinkedIn', 'launchpad' ) }
							>
								<SocialLogo className="share-site-modal__modal-icon" size={ 24 } icon="linkedin" />
								<span>{ __( 'LinkedIn', 'launchpad' ) }</span>
							</a>
							<a
								href="https://wordpress.com"
								className="share-site-modal__modal-share-link"
								title={ __( 'Share on Medium', 'launchpad' ) }
							>
								<SocialLogo className="share-site-modal__modal-icon" size={ 24 } icon="medium" />
								<span>{ __( 'Medium', 'launchpad' ) }</span>
							</a>
							<a
								href="https://wordpress.com"
								className="share-site-modal__modal-share-link"
								title={ __( 'Share on Telegram', 'launchpad' ) }
							>
								<SocialLogo className="share-site-modal__modal-icon" size={ 24 } icon="telegram" />
								<span>{ __( 'Telegram', 'launchpad' ) }</span>
							</a>
							<a
								href={ `http://www.reddit.com/submit?url=${ encodeURI(
									'https://' + siteSlug
								) }&title=` }
								className="share-site-modal__modal-share-link"
								title={ __( 'Share on Reddit', 'launchpad' ) }
							>
								<SocialLogo className="share-site-modal__modal-icon" size={ 24 } icon="whatsapp" />
								<span>{ __( 'Reddit', 'launchpad' ) }</span>
							</a>
							<a
								href={ `https://api.whatsapp.com/send?text=${ encodeURI(
									'https://' + siteSlug
								) } ` }
								className="share-site-modal__modal-share-link"
								title={ __( 'Share on WhatsApp', 'launchpad' ) }
							>
								<SocialLogo className="share-site-modal__modal-icon" size={ 24 } icon="whatsapp" />
								<span>{ __( 'WhatsApp', 'launchpad' ) }</span>
							</a>
							<a
								href={ `https://x.com/intent/post?url=${ encodeURI(
									'https://' + siteSlug
								) }&text=` }
								className="share-site-modal__modal-share-link"
								title={ __( 'Share on X', 'launchpad' ) }
							>
								<SocialLogo className="share-site-modal__modal-icon" size={ 24 } icon="x" />
								<span>{ __( 'X', 'launchpad' ) }</span>
							</a>
						</div>
					</div>
				</div>
			</Modal>
		</>
	);
};

export default ShareSiteModal;
