/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import { getActivePartnerKey } from 'calypso/state/partner-portal/partner/selectors';

export default function LandingPage(): React.ReactElement | null {
	const activePartnerKey = useSelector( getActivePartnerKey );

	useEffect( () => {
		if ( activePartnerKey?.hasLicenses ) {
			return page.redirect( '/partner-portal/billing' );
		}

		return page.redirect( '/partner-portal/licenses' );
	}, [ activePartnerKey ] );

	return null;
}
