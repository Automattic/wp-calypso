import 'calypso/state/route/init';
import isWCCOM from './get-is-wccom';
import isWooPasswordlessJPCFlow from './is-woo-passwordless-jpc-flow';
import type { AppState } from 'calypso/types';

/**
 * Return if it's Woo (either via WCCOM or WOO JPC Flow)
 *
 */
export default function getIsWoo( state: AppState ): boolean {
	if ( isWooPasswordlessJPCFlow( state ) || isWCCOM( state ) ) {
		return true;
	}

	return false;
}
