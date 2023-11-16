import { useCallback, useEffect } from 'react';
import { ThunkDispatch } from 'redux-thunk';
import { useSiteDomainsForSlug } from 'calypso/landing/stepper/hooks/use-site-domains';
import { verifyIcannEmail } from 'calypso/state/domains/management/actions';
import { useDispatch } from 'calypso/state/index';
import { fetchSiteDomains } from 'calypso/state/sites/domains/actions';
import { isRequestingSiteDomains } from 'calypso/state/sites/domains/selectors';
import { IAppState } from 'calypso/state/types';

const request =
	( siteId: number | undefined ) =>
	( dispatch: ThunkDispatch< IAppState, unknown, any >, getState: () => IAppState ) => {
		if ( siteId && ! isRequestingSiteDomains( getState(), siteId ) ) {
			dispatch( fetchSiteDomains( siteId ) );
		}
	};

export const useDomainEmailVerification = (
	siteId: number | undefined,
	selectedSiteSlug: string,
	domain: string
) => {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request( siteId ) );
	}, [ dispatch, siteId ] );

	const siteDomains = useSiteDomainsForSlug( selectedSiteSlug ) ?? [];
	const siteDomain = siteDomains.find( ( siteDomain ) => siteDomain.domain === domain );

	const isEmailUnverified = siteDomain?.is_pending_icann_verification;

	const onResendVerificationEmail = useCallback( () => {
		if ( isEmailUnverified ) {
			dispatch( verifyIcannEmail( domain ) );
		}
	}, [ dispatch, domain, isEmailUnverified ] );

	return { isEmailUnverified, onResendVerificationEmail };
};
