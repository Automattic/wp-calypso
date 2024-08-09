import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { addQueryArgs, getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import AddNewSiteButton from 'calypso/a8c-for-agencies/components/add-new-site-button';
import { GuidedTourStep } from 'calypso/a8c-for-agencies/components/guided-tour-step';
import { A4A_MARKETPLACE_PRODUCTS_LINK, A4A_SITES_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import SiteConfigurationsModal from 'calypso/a8c-for-agencies/components/site-configurations-modal';
import { useRandomSiteName } from 'calypso/a8c-for-agencies/components/site-configurations-modal/use-random-site-name';
import useFetchPendingSites from 'calypso/a8c-for-agencies/data/sites/use-fetch-pending-sites';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import SitesDashboardContext from '../sites-dashboard-context';

import './style.scss';

type Props = {
	onWPCOMImport?: ( blogIds: number[] ) => void;
};

export default function SitesHeaderActions( { onWPCOMImport }: Props ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const isMobile = useMobileBreakpoint();
	const { randomSiteName, isRandomSiteNameLoading } = useRandomSiteName();
	const { refetch: refetchPendingSites } = useFetchPendingSites();

	const [ tourStepRef, setTourStepRef ] = useState< HTMLElement | null >( null );
	const [ showConfigurationModal, setShowConfigurationModal ] = useState( false );

	const toggleDevSiteConfigurationsModal = useCallback( () => {
		setShowConfigurationModal( ! showConfigurationModal );
	}, [ showConfigurationModal ] );

	const { setRecentlyCreatedSiteId } = useContext( SitesDashboardContext );

	const onCreateSiteSuccess = useCallback(
		( id: number ) => {
			refetchPendingSites();
			setRecentlyCreatedSiteId( id );
			page( addQueryArgs( A4A_SITES_LINK, { created_site: id } ) );
		},
		[ refetchPendingSites ]
	);

	const devSitesEnabled = config.isEnabled( 'a4a-dev-sites' );

	const addNewDevSite = getQueryArg( window.location.href, 'add_new_dev_site' );

	useEffect( () => {
		if ( devSitesEnabled && addNewDevSite ) {
			toggleDevSiteConfigurationsModal?.();
		}
	}, [ addNewDevSite, devSitesEnabled, toggleDevSiteConfigurationsModal ] );

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
			{ devSitesEnabled && (
				<AddNewSiteButton
					showMainButtonLabel={ ! isMobile }
					devSite
					toggleDevSiteConfigurationsModal={ toggleDevSiteConfigurationsModal }
				/>
			) }
			<div ref={ ( ref ) => setTourStepRef( ref ) }>
				<AddNewSiteButton showMainButtonLabel={ ! isMobile } onWPCOMImport={ onWPCOMImport } />
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
