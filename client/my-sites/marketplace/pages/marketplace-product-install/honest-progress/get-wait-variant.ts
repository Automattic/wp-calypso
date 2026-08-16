import { isEnabled } from '@automattic/calypso-config';

export type WaitVariant = 'control' | 'honest_progress' | 'honest_scene';

/**
 * Which wait UI the transfer path shows. Both honest variants sit behind the base flag; the
 * scene flag picks the graphic one on top of it, so the scene can never appear without the
 * honest clock underneath.
 */
export function getWaitVariant(): WaitVariant {
	if ( ! isEnabled( 'marketplace-honest-install-progress' ) ) {
		return 'control';
	}
	return isEnabled( 'marketplace-honest-install-progress-scene' )
		? 'honest_scene'
		: 'honest_progress';
}
