import { useLatestWPVersions } from 'calypso/data/wp-version/use-wp-version-query';
import version_compare from 'calypso/lib/version-compare';

const WP_VERSIONS_TO_CHECK = 3;

/**
 * Checks if a plugin is tested at least WP_VERSIONS_TO_CHECK versions below current WordPress version.
 * If the plugin was tested in an older than WP_VERSIONS_TO_CHECK versions, it is considered not maintained.
 * @param {string} testedVersion - The version of the plugin to check.
 * @returns {boolean} True if the plugin was tested less than WP_VERSIONS_TO_CHECK WordPress versions ago,
 *                    false otherwise.
 */
export function usePluginIsMaintained( testedVersion ) {
	const { data: wpVersions } = useLatestWPVersions();
	const wpVersionToCheck = wpVersions?.[ WP_VERSIONS_TO_CHECK ];
	let isMaintained = true;
	if ( wpVersionToCheck && testedVersion ) {
		isMaintained = version_compare( wpVersionToCheck, testedVersion, '<=' );
	}
	return isMaintained;
}
