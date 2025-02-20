import { localizeUrl } from '@automattic/i18n-utils';
import { ActionButtons, BackButton, NextButton } from '@automattic/onboarding';
import { Modal, Button, ButtonGroup } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import SitesDropdown from 'calypso/components/sites-dropdown';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import getSites from 'calypso/state/selectors/get-sites';
import getIsSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

function useOtherOwnedSiteIDs() {
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

type MigrateSubscribersModalState = 'selection' | 'confirmation';

const MigrateSubscribersModal = ( {
	isVisible,
	onClose,
	migrateSubscribersCallback,
}: {
	isVisible: boolean;
	onClose: () => void;
	migrateSubscribersCallback: ( selectedSourceSiteId: number ) => void;
} ) => {
	const translate = useTranslate();
	const targetSite = useSelector( getSelectedSite );
	const targetSiteId = useSelector( getSelectedSiteId );

	const [ sourceSiteId, setSourceSiteId ] = useState();
	const targetSiteName = targetSite?.name || targetSite?.URL || '';

	const eligibleSiteIDs = useOtherOwnedSiteIDs();

	const modalTitle = translate( 'Migrate subscribers to {{strong}}%(targetSiteName)s{{/strong}}', {
		args: { targetSiteName: targetSite?.name || targetSite?.URL || '' },
		components: { strong: <strong /> },
	} );

	const [ modalState, setModalState ] = useState< MigrateSubscribersModalState >( 'selection' );

	const selectedSourceSiteId = sourceSiteId || eligibleSiteIDs[ 0 ];
	const selectedSourceSite = useSelector( ( state ) => getSite( state, selectedSourceSiteId ) );
	const selectedSourceSiteName = selectedSourceSite?.name || selectedSourceSite?.URL || '';

	const isWPCOMSite = useSelector( ( state ) => getIsSiteWPCOM( state, targetSiteId ) );

	if ( ! isVisible ) {
		return null;
	}

	const migrateSubscribersUrl = ! isWPCOMSite
		? 'https://jetpack.com/support/newsletter/import-subscribers/#migrate-subscribers-from-a-word-press-com-site'
		: 'https://wordpress.com/support/migrate-subscribers-from-another-site/';

	const selectionRender = (
		<div className="migrate-subscribers-modal__content">
			<div className="migrate-subscribers-modal__form--container">
				<p className="migrate-subscribers-modal__form--disclaimer">
					{ translate(
						'This will migrate all of the subscribers from the site you select below to the current site "{{strong}}%(targetSiteName)s{{/strong}}".',
						{
							args: { targetSiteName },
							components: { strong: <strong /> },
						}
					) }
				</p>
				<label className="migrate-subscribers-modal__label">{ translate( 'Migrate from' ) }</label>
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
						translate( 'For more details, take a look at our <Button>support document</Button>.' ),
						{
							Button: (
								<Button
									variant="link"
									target="_blank"
									href={ localizeUrl( migrateSubscribersUrl ) }
								/>
							),
						}
					) }
				</p>
			</div>

			<NextButton
				type="submit"
				className="migrate-subscriber__form-submit-btn"
				disabled={ ! selectedSourceSiteId }
				onClick={ () => {
					recordTracksEvent( 'calypso_subscribers_migrate_subscribers_confirmation' );
					setModalState( 'confirmation' );
				} }
			>
				{ translate( 'Migrate subscribers' ) }
			</NextButton>
		</div>
	);

	const confirmationRender = (
		<div className="migrate-subscribers-modal__content">
			<div className="migrate-subscribers-modal__form--container">
				<p className="migrate-subscribers-modal__form--disclaimer">
					{ translate(
						'This will {{strong}}move{{/strong}} all of the subscribers from {{strong}}%(selectedSourceSiteName)s{{/strong}} to {{strong}}%(targetSiteName)s{{/strong}}. Are you sure?',
						{
							args: { selectedSourceSiteName, targetSiteName },
							components: { strong: <strong /> },
						}
					) }
				</p>
			</div>

			<ButtonGroup>
				<ActionButtons>
					<BackButton
						className="migrate-subscriber__form-cancel-btn"
						onClick={ () => {
							recordTracksEvent( 'calypso_subscribers_migrate_subscribers_back_to_selection' );
							setModalState( 'selection' );
						} }
					>
						{ translate( 'Go back' ) }
					</BackButton>

					<NextButton
						type="submit"
						className="migrate-subscriber__form-submit-btn"
						disabled={ ! selectedSourceSiteId }
						onClick={ () => {
							setModalState( 'selection' );
							recordTracksEvent( 'calypso_subscribers_migrate_subscribers_start_migration', {
								source_site_id: sourceSiteId,
								target_site_id: targetSiteId,
							} );
							selectedSourceSiteId &&
								targetSiteId &&
								migrateSubscribersCallback( selectedSourceSiteId );
						} }
					>
						{ translate( 'Confirm subscriber move' ) }
					</NextButton>
				</ActionButtons>
			</ButtonGroup>
		</div>
	);

	return (
		<Modal
			title={ modalTitle as string }
			onRequestClose={ () => {
				recordTracksEvent( 'calypso_subscribers_migrate_subscribers_cancel' );
				//Setting a delay to prevent a flicker.
				setTimeout( setModalState, 50, 'selection' );
				onClose();
			} }
			overlayClassName="migrate-subscribers-modal"
		>
			{ modalState === 'selection' && selectionRender }
			{ modalState === 'confirmation' && confirmationRender }
		</Modal>
	);
};

export default MigrateSubscribersModal;
