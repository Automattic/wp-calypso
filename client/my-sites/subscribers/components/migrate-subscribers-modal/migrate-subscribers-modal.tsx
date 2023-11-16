import { localizeUrl } from '@automattic/i18n-utils';
import { NextButton } from '@automattic/onboarding';
import { Modal, Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import SitesDropdown from 'calypso/components/sites-dropdown';
import { useSubscribersPage } from 'calypso/my-sites/subscribers/components/subscribers-page/subscribers-page-context';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import getSites from 'calypso/state/selectors/get-sites';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

function useSelectedOtherSimpleSiteIDs() {
	const targetSiteId = useSelector( getSelectedSiteId );
	const allSites = useSelector( getSites );
	const currentUserId = useSelector( getCurrentUserId );

	if ( ! allSites ) {
		return [];
	}

	return allSites
		.filter( ( site ) => site?.ID !== targetSiteId && site?.site_owner === currentUserId )
		.map( ( site ) => site?.ID );
}

const MigrateSubscribersModal = () => {
	const translate = useTranslate();

	const { showMigrateSubscribersModal, closeAllModals, migrateSubscribersCallback } =
		useSubscribersPage();
	const targetSite = useSelector( getSelectedSite );
	const targetSiteId = useSelector( getSelectedSiteId );

	const [ sourceSiteId, setSourceSiteId ] = useState();
	const targetSiteName = targetSite?.name || targetSite?.URL || '';

	const eligibleSiteIDs = useSelectedOtherSimpleSiteIDs();

	const modalTitle = translate( 'Migrate subscribers to {{strong}}%(targetSiteName)s{{/strong}}', {
		args: { targetSiteName: targetSite?.name || targetSite?.URL || '' },
		components: { strong: <strong /> },
	} );

	if ( ! showMigrateSubscribersModal ) {
		return null;
	}

	const selectedSourceSiteId = sourceSiteId || eligibleSiteIDs[ 0 ];

	return (
		<Modal
			title={ modalTitle as string }
			onRequestClose={ closeAllModals }
			overlayClassName="migrate-subscribers-modal"
		>
			<div className="migrate-subscribers-modal__content">
				<div className="migrate-subscribers-modal__form--container">
					<p className="migrate-subscribers-modal__form--disclaimer">
						{ translate(
							'This will migrate all of the subscribers from the site you select below to the current site, "{{strong}}%(targetSiteName)s{{/strong}}".',
							{
								args: { targetSiteName },
								components: { strong: <strong /> },
							}
						) }
					</p>
					<label className="migrate-subscribers-modal__label">
						{ translate( 'Migrate from' ) }
					</label>
					<SitesDropdown
						key={ sourceSiteId }
						isPlaceholder={ false }
						selectedSiteId={ selectedSourceSiteId }
						onSiteSelect={ setSourceSiteId }
						filter={ ( siteId ) => {
							return eligibleSiteIDs.includes( siteId );
						} }
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
					disabled={ ! selectedSourceSiteId }
					onClick={ () =>
						selectedSourceSiteId &&
						targetSiteId &&
						migrateSubscribersCallback( selectedSourceSiteId, targetSiteId )
					}
				>
					{ translate( 'Migrate subscribers' ) }
				</NextButton>
			</div>
		</Modal>
	);
};

export default MigrateSubscribersModal;
