import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { useBreakpoint } from '@automattic/viewport-react';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useContext, useState } from 'react';
import { useDispatch } from 'react-redux';
import AddNewSiteButton from 'calypso/a8c-for-agencies/components/add-new-site-button';
import {
	A4A_MARKETPLACE_PRODUCTS_LINK,
	A4A_SITES_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import SiteConfigurationsModal from 'calypso/a8c-for-agencies/components/site-configurations-modal';
import { useRandomSiteName } from 'calypso/a8c-for-agencies/components/site-configurations-modal/use-random-site-name';
import useFetchPendingSites from 'calypso/a8c-for-agencies/data/sites/use-fetch-pending-sites';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import SitesDashboardContext from '../../sites/sites-dashboard-context';

import './style.scss';

export default function OverviewHeaderActions() {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const isNarrowView = useBreakpoint( '<660px' );
	const { randomSiteName, isRandomSiteNameLoading, refetchRandomSiteName } = useRandomSiteName();
	const { refetch: refetchPendingSites } = useFetchPendingSites();
	const [ showConfigurationModal, setShowConfigurationModal ] = useState( false );

	const toggleDevSiteConfigurationsModal = useCallback( () => {
		setShowConfigurationModal( ! showConfigurationModal );
	}, [ showConfigurationModal ] );

	const { setRecentlyCreatedSiteId } = useContext( SitesDashboardContext );

	const onCreateSiteSuccess = useCallback(
		( id: number ) => {
			refetchPendingSites();
			refetchRandomSiteName();
			setRecentlyCreatedSiteId( id );
			page( addQueryArgs( A4A_SITES_LINK, { created_site: id } ) );
		},
		[ refetchPendingSites, refetchRandomSiteName, setRecentlyCreatedSiteId ]
	);

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
			<AddNewSiteButton
				showMainButtonLabel={ ! isNarrowView }
				toggleDevSiteConfigurationsModal={ toggleDevSiteConfigurationsModal }
			/>
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
