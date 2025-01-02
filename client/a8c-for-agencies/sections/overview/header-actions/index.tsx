import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { useBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import AddNewSiteButton from 'calypso/a8c-for-agencies/components/add-new-site-button';
import { A4A_MARKETPLACE_PRODUCTS_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import SiteConfigurationsModal from 'calypso/a8c-for-agencies/components/site-configurations-modal';
import { useRandomSiteName } from 'calypso/a8c-for-agencies/components/site-configurations-modal/use-random-site-name';
import useSiteCreatedCallback from 'calypso/a8c-for-agencies/hooks/use-site-created-callback';
import AddNewSite from 'calypso/components/add-new-site';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

export default function OverviewHeaderActions() {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const isNarrowView = useBreakpoint( '<660px' );
	const { randomSiteName, isRandomSiteNameLoading, refetchRandomSiteName } = useRandomSiteName();
	const [ showConfigurationModal, setShowConfigurationModal ] = useState( false );

	const toggleDevSiteConfigurationsModal = useCallback( () => {
		setShowConfigurationModal( ! showConfigurationModal );
	}, [ showConfigurationModal ] );

	const onCreateSiteSuccess = useSiteCreatedCallback( refetchRandomSiteName );

	return (
		<div className="overview-header__actions">
			{ showConfigurationModal && (
				<SiteConfigurationsModal
					closeModal={ toggleDevSiteConfigurationsModal }
					randomSiteName={ randomSiteName }
					isRandomSiteNameLoading={ isRandomSiteNameLoading }
					onCreateSiteSuccess={ onCreateSiteSuccess }
				/>
			) }
			{ isEnabled( 'a4a-updated-add-new-site' ) ? (
				<AddNewSite />
			) : (
				<AddNewSiteButton
					showMainButtonLabel={ ! isNarrowView }
					toggleDevSiteConfigurationsModal={ toggleDevSiteConfigurationsModal }
				/>
			) }
			{ ! isNarrowView && (
				<Button
					primary
					href={ A4A_MARKETPLACE_PRODUCTS_LINK }
					onClick={ () => {
						dispatch( recordTracksEvent( 'calypso_a4a_overview_add_products_click' ) );
					} }
				>
					{ translate( 'Add products' ) }
				</Button>
			) }
		</div>
	);
}
