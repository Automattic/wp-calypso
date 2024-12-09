import {
	WPCOM_FEATURES_REAL_TIME_BACKUPS,
	WPCOM_FEATURES_SCAN,
	FEATURE_REPUBLICIZE,
	WPCOM_FEATURES_CLASSIC_SEARCH,
} from '@automattic/calypso-products';
import { useSelector } from 'react-redux';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

/**
 * Checks if a plugin is equivalent to already included features of an Atomic site.
 * For example, Atomic sites aleady include features such as Jetpack Backup, scan, videopress,
 * publicize, and search. This hook returns whether the plugin given is equivalent to any of those
 * included features.
 * @param   {string}  pluginSlug - The slug of the plugin to check.
 * @returns {boolean} True if the plugin is equivalent to any of the Atomic site features.
 */
export default function useAtomicSiteHasEquivalentFeatureToPlugin( pluginSlug: string ) {
	const selectedSiteId = useSelector( getSelectedSiteId );
	const isAtomic = useSelector( ( state ) => isAtomicSite( state, selectedSiteId ) );

	const atomicFeaturesIncludedInPluginsMap = {
		'jetpack-backup': WPCOM_FEATURES_REAL_TIME_BACKUPS,
		'jetpack-protect': WPCOM_FEATURES_SCAN,
		'jetpack-social': FEATURE_REPUBLICIZE,
		'jetpack-search': WPCOM_FEATURES_CLASSIC_SEARCH,
	};
	const featureEquivalentToPlugin =
		( isAtomic &&
			atomicFeaturesIncludedInPluginsMap[
				pluginSlug as keyof typeof atomicFeaturesIncludedInPluginsMap
			] ) ||
		'';

	return useSelector( ( state ) =>
		siteHasFeature( state, selectedSiteId, featureEquivalentToPlugin )
	);
}
