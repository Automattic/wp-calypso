/**
 * Internal dependencies
 */
import 'calypso/state/plugins/init';
import { IAppState } from '../reducer';

export function getPrimaryDomain( state: IAppState ): string | undefined {
	return state?.plugins.marketplace.purchaseFlow.primaryDomain;
}
