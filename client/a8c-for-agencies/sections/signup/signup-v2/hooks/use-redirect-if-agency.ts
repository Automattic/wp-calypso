import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { useEffect } from 'react';
import { ONBOARDING_TOUR_HASH } from 'calypso/a8c-for-agencies/components/hoc/with-onboarding-tour/hooks/use-onboarding-tour';
import { A4A_OVERVIEW_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';

export default function useRedirectIfAgency() {
	const currentAgency = useSelector( getActiveAgency );

	useEffect( () => {
		if ( currentAgency ) {
			if ( isEnabled( 'a4a-unified-onboarding-tour' ) ) {
				page.redirect( `${ A4A_OVERVIEW_LINK }${ ONBOARDING_TOUR_HASH }` );
			} else {
				page.redirect( A4A_OVERVIEW_LINK );
			}
		}
	}, [ currentAgency ] );
}
