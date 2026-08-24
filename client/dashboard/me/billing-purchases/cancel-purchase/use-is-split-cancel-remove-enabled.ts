import { isEnabled } from '@automattic/calypso-config';

export function useIsSplitCancelRemoveEnabled(): boolean {
	return isEnabled( 'purchases/split-cancel-remove' );
}
