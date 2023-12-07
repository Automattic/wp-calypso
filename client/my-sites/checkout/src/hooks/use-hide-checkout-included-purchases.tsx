import isAkismetCheckout from 'calypso/lib/akismet/is-akismet-checkout';
import { useExperiment } from 'calypso/lib/explat';
import isJetpackCheckout from 'calypso/lib/jetpack/is-jetpack-checkout';
import { useSelector } from 'calypso/state';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSectionName } from 'calypso/state/ui/selectors';

export function useHideCheckoutIncludedPurchases(): 'loading' | 'treatment' | 'control' {
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );

	const isJetpackNotAtomic = useSelector(
		( state ) => isJetpackSite( state, siteId ) && ! isSiteAutomatedTransfer( state, siteId )
	);
	const isWPcomCheckout =
		useSelector( getSectionName ) === 'checkout' &&
		! isJetpackCheckout() &&
		! isAkismetCheckout() &&
		! isJetpackNotAtomic;

	const [ isLoadingExperimentAssignment, experimentAssignment ] = useExperiment(
		'wp_calypso_checkout_included_purchases_visibility',
		{ isEligible: isWPcomCheckout }
	);

	// Is loading experiment assignment
	if ( isLoadingExperimentAssignment ) {
		return 'loading';
	}
	// Done loading experiment assignment, and treatment assignment found
	if ( experimentAssignment?.variationName === 'treatment' ) {
		return 'treatment';
	}
	// Done loading experiment assignment, and control or null assignment found
	return 'control';
}
