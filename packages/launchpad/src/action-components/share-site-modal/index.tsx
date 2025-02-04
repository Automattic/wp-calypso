import { Popover } from '@automattic/components';
import { updateLaunchpadSettings } from '@automattic/data-stores';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, link } from '@wordpress/icons';
import { useState, useRef } from 'react';
import type { SiteDetails } from '@automattic/data-stores';

import './style.scss';

interface ShareSiteModalProps {
	setModalIsOpen: ( isOpen: boolean ) => void;
	site: SiteDetails | null;
}

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
		if ( siteSlug ) {
			await updateLaunchpadSettings( siteSlug, {
				checklist_statuses: { share_site: true },
			} );
		}
		queryClient.invalidateQueries( { queryKey: [ 'launchpad' ] } );
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
								'Now you can head over to your site and share it with the world.',
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
								className="share-site-modal__modal-view-site"
								disabled={ ! siteSlug }
							>
								<Icon icon={ link } size={ 22 } />
								<span className="share-site-modal__modal-view-site-text">
									{ __( 'Copy', 'launchpad' ) }
								</span>
							</Button>
						</div>
					</div>
				</div>
			</Modal>
		</>
	);
};

export default ShareSiteModal;
