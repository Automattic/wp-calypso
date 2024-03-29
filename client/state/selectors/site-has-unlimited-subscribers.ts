import { FEATURE_UNLIMITED_SUBSCRIBERS } from '@automattic/calypso-products';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import type { AppState } from 'calypso/types';

export default function siteHasUnlimitedSubscribers( state: AppState, siteId: number | null ) {
	return siteHasFeature( state, siteId, FEATURE_UNLIMITED_SUBSCRIBERS );
}
