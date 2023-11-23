import { hasCheckoutVersion } from '@automattic/wpcom-checkout';

export function useToSFoldableCard(): boolean {
	if ( hasCheckoutVersion( 'tos-foldable-card' ) ) {
		return true;
	}
	return false;
}
