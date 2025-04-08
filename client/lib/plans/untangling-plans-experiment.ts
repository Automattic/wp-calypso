import { isEnabled } from '@automattic/calypso-config';
import type { AppState } from 'calypso/types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function isPlansPageUntangled( state: AppState ) {
	return isEnabled( 'untangling/plans' );
}
