import { useWPVersion } from 'calypso/data/wp-version/use-wp-version-query';
import version_compare from 'calypso/lib/version-compare';

const WP_VERSIONS_TO_CHECK = 3;

export default function usePluginIsMaintained( testedVersion ) {
	const { data: wpVersions } = useWPVersion();
	const wpVersionToCheck = wpVersions?.[ WP_VERSIONS_TO_CHECK ];
	let isMaintained = true;
	if ( wpVersionToCheck && testedVersion ) {
		isMaintained = version_compare( wpVersionToCheck, testedVersion, '<=' );
	}
	return isMaintained;
}
