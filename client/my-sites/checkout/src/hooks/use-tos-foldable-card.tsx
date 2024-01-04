import isAkismetCheckout from 'calypso/lib/akismet/is-akismet-checkout';
import isJetpackCheckout from 'calypso/lib/jetpack/is-jetpack-checkout';
import { useSelector } from 'calypso/state';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSectionName } from 'calypso/state/ui/selectors';

export function useToSFoldableCard(): boolean {
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const section = useSelector( getSectionName );
	const isJetpackNotAtomic = useSelector(
		( state ) => isJetpackSite( state, siteId ) && ! isSiteAutomatedTransfer( state, siteId )
	);

	const enabledSections = [ 'business-plan-upgrade-upsell', 'checkout' ];

	const isWPcomCheckout =
		section != null &&
		enabledSections.includes( section ) &&
		! isJetpackCheckout() &&
		! isAkismetCheckout() &&
		! isJetpackNotAtomic;

	/* Only show the foldable card on the checkout page for WPCOM,
	 * further testing for Jetpack and Akismet is required before removing this hook
	 * and showing the foldable ToS for all checkout pages.
	 */
	if ( isWPcomCheckout ) {
		return true;
	}

	return false;
}
