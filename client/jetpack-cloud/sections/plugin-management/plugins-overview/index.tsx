import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useQueryJetpackPartnerPortalPartner } from 'calypso/components/data/query-jetpack-partner-portal-partner';
import JetpackLogo from 'calypso/components/jetpack-logo';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import SelectPartnerKey from 'calypso/jetpack-cloud/sections/partner-portal/primary/select-partner-key';
import PluginsMain from 'calypso/my-sites/plugins/main';
import PluginDetails from 'calypso/my-sites/plugins/plugin-details';
import { useDispatch, useSelector } from 'calypso/state';
import {
	hasActivePartnerKey,
	hasFetchedPartner,
	isFetchingPartner,
} from 'calypso/state/partner-portal/partner/selectors';
import { setSelectedSiteId } from 'calypso/state/ui/actions';

import './style.scss';

interface Props {
	filter?: string;
	search?: string;
	site?: string;
	pluginSlug?: string;
	path?: string;
}

export default function PluginsOverview( { filter, search, site, pluginSlug, path }: Props ) {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const hasFetched = useSelector( hasFetchedPartner );
	const isFetching = useSelector( isFetchingPartner );
	const hasActiveKey = useSelector( hasActivePartnerKey );

	// Reset selected site id for multi-site view since it is never reset
	// and the <PluginsMain /> component behaves differently when there
	// is a selected site which is incorrect for multi-site view
	useEffect( () => {
		if ( ! site ) {
			dispatch( setSelectedSiteId( null ) );
		}
	}, [ dispatch, site ] );

	useQueryJetpackPartnerPortalPartner();

	if ( hasFetched && ! hasActiveKey ) {
		return <SelectPartnerKey />;
	}

	if ( hasFetched ) {
		return (
			<div className="plugins-overview__container">
				<SidebarNavigation sectionTitle={ translate( 'Plugins' ) } />
				{ pluginSlug ? (
					<PluginDetails isJetpackCloud siteUrl={ site } pluginSlug={ pluginSlug } path={ path } />
				) : (
					<PluginsMain isJetpackCloud filter={ filter } search={ search } />
				) }
			</div>
		);
	}

	return isFetching ? <JetpackLogo className="plugins-overview__logo" size={ 72 } /> : null;
}
