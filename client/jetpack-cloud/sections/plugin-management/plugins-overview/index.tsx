import config from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { ReactElement, useEffect } from 'react';
import { useSelector } from 'react-redux';
import JetpackLogo from 'calypso/components/jetpack-logo';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import SelectPartnerKey from 'calypso/jetpack-cloud/sections/partner-portal/primary/select-partner-key';
import PluginsMain from 'calypso/my-sites/plugins/main';
import {
	hasActivePartnerKey,
	hasFetchedPartner,
	isFetchingPartner,
	isAgencyUser,
} from 'calypso/state/partner-portal/partner/selectors';

import './style.scss';

interface Props {
	filter: string;
	search: string;
}

export default function PluginOverview( { filter, search }: Props ): ReactElement {
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

	if ( hasFetched && ! hasActiveKey ) {
		return <SelectPartnerKey />;
	}

	if ( hasFetched ) {
		return (
			<div className="plugins-overview__container">
				<SidebarNavigation sectionTitle={ translate( 'Plugins' ) } />
				<PluginsMain isJetpackCloud filter={ filter } search={ search } />
			</div>
		);
	}

	return (
		<>{ isFetching ? <JetpackLogo className="plugins-overview__logo" size={ 72 } /> : null }</>
	);
}
