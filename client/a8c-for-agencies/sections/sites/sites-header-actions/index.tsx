import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import AddNewSiteButton from 'calypso/a8c-for-agencies/components/add-new-site-button';
import { A4A_MARKETPLACE_PRODUCTS_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import SiteConfigurationsModal from 'calypso/a8c-for-agencies/components/site-configurations-modal';
import { useRandomSiteName } from 'calypso/a8c-for-agencies/components/site-configurations-modal/use-random-site-name';
import useSiteCreatedCallback from 'calypso/a8c-for-agencies/hooks/use-site-created-callback';
import AddNewSite from 'calypso/components/add-new-site';
import { GuidedTourStep } from 'calypso/components/guided-tour/step';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import './style.scss';

type Props = {
	onWPCOMImport?: ( blogIds: number[] ) => void;
};

export default function SitesHeaderActions( { onWPCOMImport }: Props ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const isMobile = useMobileBreakpoint();
	const { randomSiteName, isRandomSiteNameLoading, refetchRandomSiteName } = useRandomSiteName();

	const [ tourStepRef, setTourStepRef ] = useState< HTMLElement | null >( null );

	const shouldAutoOpenDevSiteConfigModal = Boolean(
		getQueryArg( window.location.href, 'add_new_dev_site' )
	);
	const [ showConfigurationModal, setShowConfigurationModal ] = useState(
		shouldAutoOpenDevSiteConfigModal
	);

	const toggleDevSiteConfigurationsModal = useCallback( () => {
		setShowConfigurationModal( ! showConfigurationModal );
	}, [ showConfigurationModal ] );

	const onCreateSiteSuccess = useSiteCreatedCallback( refetchRandomSiteName );

	return (
		<div className="sites-header__actions">
			{ showConfigurationModal && (
				<SiteConfigurationsModal
					closeModal={ toggleDevSiteConfigurationsModal }
					randomSiteName={ randomSiteName }
					isRandomSiteNameLoading={ isRandomSiteNameLoading }
					onCreateSiteSuccess={ onCreateSiteSuccess }
				/>
			) }
			<div ref={ ( ref ) => setTourStepRef( ref ) }>
				{ isEnabled( 'a4a-updated-add-new-site' ) ? (
					<AddNewSite />
				) : (
					<AddNewSiteButton
						showMainButtonLabel={ ! isMobile }
						onWPCOMImport={ onWPCOMImport }
						toggleDevSiteConfigurationsModal={ toggleDevSiteConfigurationsModal }
					/>
				) }
			</div>
			<GuidedTourStep id="add-new-site" tourId="addSiteStep1" context={ tourStepRef } />
			<Button
				primary
				href={ A4A_MARKETPLACE_PRODUCTS_LINK }
				onClick={ () => {
					dispatch( recordTracksEvent( 'calypso_a4a_sites_add_products_click' ) );
				} }
			>
				{ translate( 'Add products' ) }
			</Button>
		</div>
	);
}
