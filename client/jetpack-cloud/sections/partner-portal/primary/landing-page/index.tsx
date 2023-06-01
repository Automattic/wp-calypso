import page from 'page';
import { useEffect } from 'react';
import { useSelector } from 'calypso/state';
import { getActivePartnerKey } from 'calypso/state/partner-portal/partner/selectors';

export default function LandingPage() {
	const activePartnerKey = useSelector( getActivePartnerKey );

	useEffect( () => {
		if ( activePartnerKey?.hasLicenses ) {
			return page.redirect( '/partner-portal/billing' );
		}

		return page.redirect( '/partner-portal/licenses' );
	}, [ activePartnerKey ] );

	return null;
}
