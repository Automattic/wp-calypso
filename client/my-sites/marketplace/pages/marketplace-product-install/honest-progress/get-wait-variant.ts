import { isEnabled } from '@automattic/calypso-config';

export type WaitVariant = 'control' | 'honest_progress';

export function getWaitVariant(): WaitVariant {
	return isEnabled( 'marketplace-honest-install-progress' ) ? 'honest_progress' : 'control';
}
