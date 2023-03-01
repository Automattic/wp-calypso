import { ConfettiAnimation, Gridicon } from '@automattic/components';
import { Button, Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';

import './celebrate-launch-modal.scss';

function CelebrateLaunchModal( { setModalIsOpen, site } ) {
	const translate = useTranslate();

	useEffect( () => {
		// remove the celebrateLaunch URL param without reloading the page as soon as the modal loads
		// make sure the modal is shown only once
		window.history.replaceState(
			null,
			'',
			window.location.href.replace( '&celebrateLaunch=true', '' )
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
						{ translate(
							'Your site is live. Now you can head over to your site and share it with the world or keep working on it.'
						) }
					</p>
				</div>
				<div className="launched__modal-actions">
					<div className="launched__modal-site">
						<p className="launched__modal-domain">{ site.slug }</p>

						<Button isPrimary href={ site.URL } target="_blank">
							{ translate( 'Visit site' ) }
						</Button>
					</div>
					<Button className="launched__modal-customize" href={ `/domains/add/${ site.slug }` }>
						<Gridicon icon="domains" size={ 16 } />
						<span>{ translate( 'Customize your domain' ) }</span>
					</Button>
				</div>
			</div>
		</Modal>
	);
}

export default CelebrateLaunchModal;
