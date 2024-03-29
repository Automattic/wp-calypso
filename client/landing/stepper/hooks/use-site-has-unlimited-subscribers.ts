import { FEATURE_UNLIMITED_SUBSCRIBERS } from '@automattic/calypso-products';
import { useSelector } from 'calypso/state';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import type { AppState } from 'calypso/types';

export function useSiteHasUnlimitedSubscribers( siteId: number | null | undefined ) {
	return useSelector( ( state: AppState ) =>
		siteHasFeature( state, siteId, FEATURE_UNLIMITED_SUBSCRIBERS )
	);
}
