import { hasCheckoutVersion } from '@automattic/wpcom-checkout';
import isAkismetCheckout from 'calypso/lib/akismet/is-akismet-checkout';
import { useExperiment } from 'calypso/lib/explat';
import isJetpackCheckout from 'calypso/lib/jetpack/is-jetpack-checkout';
import { useSelector } from 'calypso/state';
import { getSectionName } from 'calypso/state/ui/selectors';

// The `isLoadingExperimentAssignment` return value of useExperiment is not
// stable across multiple calls; each instance runs its own `useEffect` which
// means that there are full renders before they return the value of the
// assignment. This can cause flickering if different components call
// `useExperiment` on the page since some components might be in their
// "loading" state and others may have an assignment.
//
// To compensate, here we cache the assignment once it has been made, as
// assignments do not change on the same calypso load.
let cachedExperimentAssignment: 'treatment' | 'control' | undefined;

export function useCheckoutV2(): 'loading' | 'treatment' | 'control' {
	const isCheckoutSection = useSelector( getSectionName ) === 'checkout';
	const isWPcomCheckout = ! isJetpackCheckout() && ! isAkismetCheckout();

	const [ isLoadingExperimentAssignment, experimentAssignment ] = useExperiment(
		'calypso_launch_checkout_v2',
		{ isEligible: isCheckoutSection && isWPcomCheckout && ! hasCheckoutVersion( '2' ) }
	);

	if ( cachedExperimentAssignment ) {
		return cachedExperimentAssignment;
	}

	// Is loading experiment assignment
	if ( isLoadingExperimentAssignment ) {
		return 'loading';
	}
	// Done loading experiment assignment, and treatment assignment found
	if ( experimentAssignment?.variationName === 'treatment' || hasCheckoutVersion( '2' ) ) {
		cachedExperimentAssignment = 'treatment';
		return 'treatment';
	}
	// Done loading experiment assignment, and control or null assignment found
	cachedExperimentAssignment = 'control';
	return 'control';
}
