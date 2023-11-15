import { hasCheckoutVersion } from '@automattic/wpcom-checkout';

export function useShouldCollapseLastStep(): boolean {
	if ( hasCheckoutVersion( 'collapse-steps' ) ) {
		return true;
	}
	return false;
}
