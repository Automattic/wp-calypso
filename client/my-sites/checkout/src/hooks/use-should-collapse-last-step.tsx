import isAkismetCheckout from 'calypso/lib/akismet/is-akismet-checkout';
import { useExperiment } from 'calypso/lib/explat';
import isJetpackCheckout from 'calypso/lib/jetpack/is-jetpack-checkout';
import { useSelector } from 'calypso/state';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export function useShouldCollapseLastStep(): 'loading' | 'collapse' | 'no-collapse' {
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );

	const isJetpackNotAtomic = useSelector(
		( state ) => isJetpackSite( state, siteId ) && ! isSiteAutomatedTransfer( state, siteId )
	);

	const isWPcomCheckout = ! isJetpackCheckout() && ! isAkismetCheckout() && ! isJetpackNotAtomic;
	const [ isLoadingExperimentAssignment, experimentAssignment ] = useExperiment(
		'wp_web_checkout_collapse_payment_method',
		{ isEligible: isWPcomCheckout }
	);

	if ( isLoadingExperimentAssignment ) {
		return 'loading';
	}

	if ( experimentAssignment?.variationName === 'treatment' ) {
		return 'collapse';
	}
	return 'no-collapse';
}
