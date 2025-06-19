import { Gridicon, ConfettiAnimation, Tooltip } from '@automattic/components';
import { SiteDetails } from '@automattic/data-stores';
import { Button, Modal } from '@wordpress/components';
import { Icon, copy } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState, useRef, useEffect } from 'react';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import { useDispatch } from 'calypso/state';
import { resetImport } from 'calypso/state/imports/actions';
import './style.scss';

interface Props {
	setModalIsOpen: ( isOpen: boolean ) => void;
	site: SiteDetails;
	importerId: string;
}

function CelebrateLaunchModal( { setModalIsOpen, site, importerId }: Props ) {
	const translate = useTranslate();

	const [ clipboardCopied, setClipboardCopied ] = useState( false );
	const clipboardButtonEl = useRef( null );
	const siteDomain = site?.slug;

	const dispatch = useDispatch();

	useEffect( () => {
		if ( site?.ID && importerId ) {
			dispatch( resetImport( site.ID, importerId ) );
		}
	}, [ importerId, dispatch, site?.ID ] );

	return (
		<Modal onRequestClose={ () => setModalIsOpen( false ) } className="launched__modal">
			<ConfettiAnimation />
			<div className="launched__modal-content">
				<div className="launched__modal-text">
					<h1 className="launched__modal-heading">
						{ translate( 'Congrats, your content is ready!' ) }
					</h1>
					<p className="launched__modal-body">
						{ translate( 'Now you can head over to your site and share it with the world' ) }
					</p>
				</div>
				<div className="launched__modal-actions">
					<div className="launched__modal-site">
						<div className="launched__modal-domain">
							<p className="launched__modal-domain-text">{ siteDomain }</p>
							<ClipboardButton
								aria-label={ translate( 'Copy URL' ) }
								text={ siteDomain }
								className="launchpad__clipboard-button"
								borderless
								compact
								onCopy={ () => setClipboardCopied( true ) }
								onMouseLeave={ () => setClipboardCopied( false ) }
								ref={ clipboardButtonEl }
							>
								<Icon icon={ copy } size={ 18 } />
							</ClipboardButton>
							<Tooltip
								context={ clipboardButtonEl.current }
								isVisible={ clipboardCopied }
								position="top"
							>
								{ translate( 'Copied to clipboard!' ) }
							</Tooltip>
						</div>

						<Button href={ site.URL } target="_blank" className="launched__modal-view-site">
							<Gridicon icon="domains" size={ 18 } />
							<span className="launched__modal-view-site-text">{ translate( 'View site' ) }</span>
						</Button>
					</div>
				</div>
			</div>
		</Modal>
	);
}

export default CelebrateLaunchModal;
