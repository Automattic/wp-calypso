import { localizeUrl } from '@automattic/i18n-utils';
import { NextButton } from '@automattic/onboarding';
import { Modal, Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import SitesDropdown from 'calypso/components/sites-dropdown';
import { useSubscribersPage } from 'calypso/my-sites/subscribers/components/subscribers-page/subscribers-page-context';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './style.scss';

const MigrateSubscribersModal = () => {
	const translate = useTranslate();

	const {
		showMigrateSubscribersModal,
		setShowMigrateSubscribersModal,
		migrateSubscribersCallback,
	} = useSubscribersPage();
	const targetSite = useSelector( getSelectedSite );

	const [ sourceSiteId, setSourceSiteId ] = useState();

	useEffect( () => {
		const handleHashChange = () => {
			// Open "add subscribers" via URL hash
			if ( window.location.hash === '#migrate-subscribers' ) {
				setShowMigrateSubscribersModal( true );
			}
		};

		// Listen to the hashchange event
		window.addEventListener( 'hashchange', handleHashChange );

		// Make it work on load as well
		handleHashChange();

		return () => {
			window.removeEventListener( 'hashchange', handleHashChange );
		};
	}, [] );

	const modalTitle = translate( 'Migrate subscribers to {{strong}}%(targetSiteName)s{{/strong}}', {
		args: { targetSiteName: targetSite?.name || targetSite?.URL || '' },
		components: { strong: <strong /> },
	} );

	if ( ! showMigrateSubscribersModal ) {
		return null;
	}

	return (
		<Modal
			title={ modalTitle as string }
			onRequestClose={ () => {
				if ( window.location.hash === '#migrate-subscribers' ) {
					// Doing this instead of window.location.hash = '' because window.location.hash keeps the # symbol
					// Also this makes the back button show the modal again, which is neat
					history.pushState(
						'',
						document.title,
						window.location.pathname + window.location.search
					);
				}
				setShowMigrateSubscribersModal( false );
			} }
			overlayClassName="migrate-subscribers-modal"
		>
			<div className="migrate-subscribers-modal__content">
				<div className="migrate-subscribers-modal__form--container">
					<label className="migrate-subscribers-modal__label">
						{ translate( 'Migrate from' ) }
					</label>
					<SitesDropdown
						key={ sourceSiteId }
						isPlaceholder={ false }
						selectedSiteId={ sourceSiteId }
						onSiteSelect={ setSourceSiteId }
					/>
					<p className="migrate-subscribers-modal__form--disclaimer">
						{ createInterpolateElement(
							translate(
								'For more details, take a look at our <Button>support document</Button>.'
							),
							{
								Button: (
									<Button
										variant="link"
										target="_blank"
										href={ localizeUrl(
											'https://jetpack.com/support/subscription-migration-tool/'
										) }
									/>
								),
							}
						) }
					</p>
				</div>

				<NextButton
					type="submit"
					className="migrate-subscriber__form-submit-btn"
					// isBusy={ inProgress }
					// disabled={ ! submitBtnReady }
					onClick={ migrateSubscribersCallback }
				>
					{ translate( 'Migrate subscribers' ) }
				</NextButton>
			</div>
		</Modal>
	);
};

export default MigrateSubscribersModal;
