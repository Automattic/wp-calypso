import { __ } from '@wordpress/i18n';
import type { Site } from '../data/types';

function getWordPressVersionTagName( versionTag: string ) {
	if ( versionTag === 'latest' ) {
		return __( 'Latest' );
	}
	if ( versionTag === 'beta' ) {
		return __( 'Beta' );
	}
	return '';
}

export function getFormattedWordPressVersion(
	site: Site,
	versionTag: string | undefined = undefined
) {
	let wpVersion = site.options?.software_version;
	if ( ! wpVersion ) {
		return '';
	}

	// The version string could have suffix like 6.8.1-alpha-60199, e.g. on Simple sites
	wpVersion = wpVersion.split( '-' )[ 0 ];

	if ( versionTag ) {
		wpVersion = `${ wpVersion } (${ getWordPressVersionTagName( versionTag ) })`;
	}

	return wpVersion;
}
