import 'calypso/state/route/init';
import isWCCOM from './get-is-wccom';
import isWooJPCFlow from './is-woo-jpc-flow';
import type { AppState } from 'calypso/types';

/**
 * Return if it's Woo (either via WCCOM or WOO JPC Flow)
 *
 */
export default function getIsWoo( state: AppState ): boolean {
	return isWooJPCFlow( state ) || isWCCOM( state );
}
