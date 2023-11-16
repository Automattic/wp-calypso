import { localizeUrl } from '@automattic/i18n-utils';
import { NextButton } from '@automattic/onboarding';
import { Modal, Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import SitesDropdown from 'calypso/components/sites-dropdown';
import { useSubscribersPage } from 'calypso/my-sites/subscribers/components/subscribers-page/subscribers-page-context';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

const MigrateSubscribersModal = () => {
	const translate = useTranslate();

	const { showMigrateSubscribersModal, closeAllModals, migrateSubscribersCallback } =
		useSubscribersPage();
	const targetSite = useSelector( getSelectedSite );
	const targetSiteId = useSelector( getSelectedSiteId );

	const [ sourceSiteId, setSourceSiteId ] = useState();
	const targetSiteName = targetSite?.name || targetSite?.URL || '';

	const modalTitle = translate(
		'Migrate subscribers to "{{strong}}%(targetSiteName)s{{/strong}}"',
		{
			args: { targetSiteName: targetSiteName },
			components: { strong: <strong /> },
		}
	);

	if ( ! showMigrateSubscribersModal ) {
		return null;
	}

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
					disabled={ ! sourceSiteId || ! targetSiteId }
					onClick={ () =>
						sourceSiteId && targetSiteId && migrateSubscribersCallback( sourceSiteId, targetSiteId )
					}
				>
					{ translate( 'Migrate subscribers' ) }
				</NextButton>
			</div>
		</Modal>
	);
};

export default MigrateSubscribersModal;
