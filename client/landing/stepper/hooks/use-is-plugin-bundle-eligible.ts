import { FEATURE_WOOP, WPCOM_FEATURES_ATOMIC } from '@automattic/calypso-products';
import { useSelect } from '@wordpress/data';
import { SITE_STORE } from '../stores';
import { useSite } from './use-site';

export function useIsPluginBundleEligible(): boolean | null {
	const site = useSite();
	const hasWooFeature = useSelect( ( select ) =>
		select( SITE_STORE ).siteHasFeature( site?.ID, FEATURE_WOOP )
	);
	const hasAtomicFeature = useSelect( ( select ) =>
		select( SITE_STORE ).siteHasFeature( site?.ID, WPCOM_FEATURES_ATOMIC )
	);

	return hasWooFeature && hasAtomicFeature;
}
