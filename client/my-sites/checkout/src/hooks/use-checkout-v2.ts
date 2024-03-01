import { hasCheckoutVersion } from '@automattic/wpcom-checkout';
import { useExperiment } from 'calypso/lib/explat';
import { useSelector } from 'calypso/state';
import { getSectionName } from 'calypso/state/ui/selectors';

export function useCheckoutV2(): 'loading' | 'treatment' | 'control' {
	const isCheckoutSection = useSelector( getSectionName ) === 'checkout';

	const [ isLoadingExperimentAssignment, experimentAssignment ] = useExperiment(
		'calypso_launch_checkout_v2',
		{ isEligible: isCheckoutSection && ! hasCheckoutVersion( '2' ) }
	);

	// Is loading experiment assignment
	if ( isLoadingExperimentAssignment ) {
		return 'loading';
	}
	// Done loading experiment assignment, and treatment assignment found
	if ( experimentAssignment?.variationName === 'treatment' || hasCheckoutVersion( '2' ) ) {
		return 'treatment';
	}
	// Done loading experiment assignment, and control or null assignment found
	return 'control';
}
