import config from '@automattic/calypso-config';
import page from 'page';
import { ReactElement, useEffect } from 'react';
import { useSelector } from 'react-redux';
import JetpackLogo from 'calypso/components/jetpack-logo';
import SelectPartnerKey from 'calypso/jetpack-cloud/sections/partner-portal/primary/select-partner-key';
import {
	hasActivePartnerKey,
	hasFetchedPartner,
	isFetchingPartner,
	isAgencyUser,
} from 'calypso/state/partner-portal/partner/selectors';

import '../style.scss';

export default function PluginManagement(): ReactElement {
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
		return <>Plugin Management</>;
	}

	return (
		<>{ isFetching ? <JetpackLogo className="plugin-management__logo" size={ 72 } /> : null }</>
	);
}
