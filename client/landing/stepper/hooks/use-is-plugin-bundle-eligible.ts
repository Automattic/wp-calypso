import { FEATURE_WOOP, WPCOM_FEATURES_ATOMIC } from '@automattic/calypso-products';
import { useSelect } from '@wordpress/data';
import debugFactory from 'debug';
import { SITE_STORE } from '../stores';
import { useSite } from './use-site';

const debug = debugFactory( 'calypso:plugin-bundle:use-is-plugin-bundle-eligible' );

export function useIsPluginBundleEligible(): boolean | null {
	const site = useSite();
	const hasWooFeature = useSelect( ( select ) =>
		select( SITE_STORE ).siteHasFeature( site?.ID, FEATURE_WOOP )
	);
	const hasAtomicFeature = useSelect( ( select ) =>
		select( SITE_STORE ).siteHasFeature( site?.ID, WPCOM_FEATURES_ATOMIC )
	);
	debug( 'useIsPluginBundleEligible: Found ', { site, hasWooFeature, hasAtomicFeature } );

	return hasWooFeature && hasAtomicFeature;
}
