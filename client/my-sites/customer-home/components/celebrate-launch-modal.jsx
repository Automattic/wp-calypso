import { ConfettiAnimation } from '@automattic/components';
import { Button, Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { omitUrlParams } from 'calypso/lib/url';

import './celebrate-launch-modal.scss';

function CelebrateLaunchModal( { setModalIsOpen, site } ) {
	const translate = useTranslate();

	useEffect( () => {
		// remove the celebrateLaunch URL param without reloading the page as soon as the modal loads
		// make sure the modal is shown only once
		window.history.replaceState(
			null,
			'',
			omitUrlParams( window.location.href, 'celebrateLaunch' )
		);
	}, [] );

	return (
		<Modal onRequestClose={ () => setModalIsOpen( false ) } className="launched__modal">
			<ConfettiAnimation />
			<div className="launched__modal-content">
				<div className="launched__modal-text">
					<h1 className="launched__modal-heading">
						{ translate( 'Congrats, your site is live!' ) }
					</h1>
					<p className="launched__modal-body">
						{ translate( 'Now you can head over to your site and share it with the world.' ) }
					</p>
				</div>
				<div className="launched__modal-actions">
					<div className="launched__modal-site">
						<p className="launched__modal-domain">{ site.slug }</p>

						<Button href={ site.URL } target="_blank">
							{ translate( 'View site' ) }
						</Button>
					</div>
				</div>
			</div>
			<div
				className="launched__modal-upsell"
				style={ { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' } }
			>
				<div className="launched__modal-upsell-content">
					<h2 className="launched__modal-upsell-heading">
						{ translate( 'Claim your free domain' ) }
					</h2>
					<p className="launched__modal-upsell-body">
						{ translate( 'Your plan includes a free domain for the first year' ) }
					</p>
				</div>
				<Button isPrimary href={ `/domains/add/${ site.slug }` }>
					<span>{ translate( 'Choose a domain' ) }</span>
				</Button>
			</div>
		</Modal>
	);
}

export default CelebrateLaunchModal;
