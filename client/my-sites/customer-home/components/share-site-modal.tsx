import { Popover } from '@automattic/components';
import { updateLaunchpadSettings } from '@automattic/data-stores';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Modal } from '@wordpress/components';
import { Icon, link } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState, useRef } from 'react';
import type { SiteDetails } from '@automattic/data-stores';

import './share-site-modal.scss';

interface ShareSiteModalProps {
	setModalIsOpen: ( isOpen: boolean ) => void;
	site: SiteDetails | null;
}

const ShareSiteModal = ( { setModalIsOpen, site }: ShareSiteModalProps ) => {
	const translate = useTranslate();
	const queryClient = useQueryClient();

	const [ clipboardCopied, setClipboardCopied ] = useState( false );
	const clipboardTextEl = useRef( null );

	const copyHandler = async () => {
		navigator.clipboard.writeText( `https://${ site?.slug }` );
		if ( site?.slug ) {
			await updateLaunchpadSettings( site.slug, {
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
						<h1 className="share-site-modal__modal-heading">{ translate( 'Share your site' ) }</h1>
						<p className="share-site-modal__modal-body">
							{ translate( 'Now you can head over to your site and share it with the world.' ) }
						</p>
					</div>
					<div className="share-site-modal__modal-actions">
						<div className="share-site-modal__modal-site">
							<div className="share-site-modal__modal-domain">
								<p className="share-site-modal__modal-domain-text" ref={ clipboardTextEl }>
									{ site?.slug }
								</p>

								<Popover
									className="share-site-modal__popover"
									isVisible={ clipboardCopied }
									context={ clipboardTextEl.current }
									position="top"
								>
									{ translate( 'Copied to clipboard!' ) }
								</Popover>
							</div>

							<Button onClick={ copyHandler } className="share-site-modal__modal-view-site">
								<Icon icon={ link } size={ 22 } />
								<span className="share-site-modal__modal-view-site-text">
									{ translate( 'Copy' ) }
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
