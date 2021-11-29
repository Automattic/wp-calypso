import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	fetchAutomatedTransferStatusOnce,
	requestEligibility,
} from 'calypso/state/automated-transfer/actions';
import {
	isFetchingAutomatedTransferStatus,
	getEligibility,
	EligibilityData,
	EligibilityWarning,
} from 'calypso/state/automated-transfer/selectors';
import { getSiteDomain } from 'calypso/state/sites/selectors';
// import { eligibilityHolds } from 'calypso/state/automated-transfer/constants';

type EligibilityHook = {
	eligibilityHolds?: string[];
	eligibilityWarnings?: EligibilityWarning[];
	isFetching: boolean;
	wpcomDomain: string | null;
	stagingDomain: string | null;
	pluginsWarning: EligibilityWarning[];
	widgetsWarning: EligibilityWarning[];
	wpcomSubdomainWarning: EligibilityWarning | undefined;
};

export default function useEligibility( siteId: number ): EligibilityHook {
	const dispatch = useDispatch();

	// Request eligibility data.
	useEffect( () => {
		if ( ! siteId ) {
			return;
		}

		dispatch( fetchAutomatedTransferStatusOnce( siteId ) );
		dispatch( requestEligibility( siteId ) );
	}, [ siteId, dispatch ] );

	// Get eligibility data.
	const {
		eligibilityHolds,
		eligibilityWarnings: allEligibilityWarnings,
	}: EligibilityData = useSelector( ( state ) => getEligibility( state, siteId ) );

	// Pick the wpcom subdomain.
	const wpcomDomain = useSelector( ( state ) => getSiteDomain( state, siteId ) );

	// Get staging sudomain based on the wpcom subdomain.
	const stagingDomain = wpcomDomain?.replace( /\b\.wordpress\.com/, '.wpcomstaging.com' ) || null;

	// Check whether it's requesting eligibility data.
	const isFetching = !! useSelector( ( state ) =>
		isFetchingAutomatedTransferStatus( state, siteId )
	);

	// Check whether the wpcom.com subdomain warning is present.
	const wpcomSubdomainWarning = allEligibilityWarnings?.find(
		( { id } ) => id === 'wordpress_subdomain'
	);

	// Plugins warnings
	const pluginsWarning = allEligibilityWarnings?.filter( ( { type } ) => type === 'plugins' ) || [];

	// Widgets warnings
	const widgetsWarning = allEligibilityWarnings?.filter( ( { type } ) => type === 'widgets' ) || [];

	// Remove warnings.
	const eligibilityWarnings = allEligibilityWarnings?.filter(
		( { id } ) => id !== 'wordpress_subdomain'
	);

	return {
		isFetching,
		eligibilityHolds,
		eligibilityWarnings,
		wpcomDomain,
		stagingDomain,
		pluginsWarning,
		widgetsWarning,
		wpcomSubdomainWarning,
	};
}
