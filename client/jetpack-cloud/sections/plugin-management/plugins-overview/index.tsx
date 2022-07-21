import config from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { ReactElement, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import JetpackLogo from 'calypso/components/jetpack-logo';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import SelectPartnerKey from 'calypso/jetpack-cloud/sections/partner-portal/primary/select-partner-key';
import PluginsMain from 'calypso/my-sites/plugins/main';
import PluginDetails from 'calypso/my-sites/plugins/plugin-details';
import {
	hasActivePartnerKey,
	hasFetchedPartner,
	isFetchingPartner,
	isAgencyUser,
} from 'calypso/state/partner-portal/partner/selectors';
import { setSelectedSiteId } from 'calypso/state/ui/actions';

import './style.scss';

interface Props {
	filter?: string;
	search?: string;
	site?: string;
	plugin?: string;
	isDetails?: boolean;
	path?: string;
}

export default function PluginOverview( {
	filter,
	search,
	site,
	plugin,
	isDetails,
	path,
}: Props ): ReactElement {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const hasFetched = useSelector( hasFetchedPartner );
	const isFetching = useSelector( isFetchingPartner );
	const hasActiveKey = useSelector( hasActivePartnerKey );
	const isAgency = useSelector( isAgencyUser );
	const isPluginManagementEnabled = config.isEnabled( 'jetpack/plugin-management' );

	useEffect( () => {
		if ( hasFetched ) {
			if ( ! isAgency || ! isPluginManagementEnabled ) {
				page.redirect( '/' );
				return;
			}
		}
	}, [ hasFetched, isAgency, isPluginManagementEnabled ] );

	// Reset selected site id for multi-site view since it is never reset
	// and the <PluginsMain /> component behaves differently when there
	// is a selected site which is incorrect for multi-site view
	useEffect( () => {
		if ( ! site ) {
			dispatch( setSelectedSiteId( null ) );
		}
	}, [ dispatch, site ] );

	if ( hasFetched && ! hasActiveKey ) {
		return <SelectPartnerKey />;
	}

	if ( hasFetched ) {
		return (
			<div className="plugins-overview__container">
				<SidebarNavigation sectionTitle={ translate( 'Plugins' ) } />
				{ isDetails ? (
					<PluginDetails isJetpackCloud siteUrl={ site } pluginSlug={ plugin } path={ path } />
				) : (
					<PluginsMain isJetpackCloud filter={ filter } search={ search } />
				) }
			</div>
		);
	}

	return (
		<>{ isFetching ? <JetpackLogo className="plugins-overview__logo" size={ 72 } /> : null }</>
	);
}
