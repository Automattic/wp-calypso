import { __ } from '@wordpress/i18n';
import { canSwitchWordPressVersion } from '../sites/features';
import type { Site } from '@automattic/api-core';

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
	return formatWordPressVersion(
		site.options?.software_version ?? '',
		versionTag,
		canSwitchWordPressVersion( site )
	);
}

export function formatWordPressVersion(
	wpVersion: string,
	versionTag: string | undefined = undefined,
	preservePreRelease: boolean = false
) {
	if ( ! wpVersion ) {
		return '';
	}

	if ( preservePreRelease ) {
		// Strip only dev suffixes like "6.8.1-alpha-60199" but keep
		// meaningful pre-release identifiers like "7.0-RC2" or "7.0-beta1".
		wpVersion = wpVersion.replace( /-alpha-\d+$/, '' );
	} else {
		// The version string could have suffix like 6.8.1-alpha-60199, e.g. on Simple sites
		wpVersion = wpVersion.split( '-' )[ 0 ];
	}

	if ( versionTag ) {
		wpVersion = `${ wpVersion } (${ getWordPressVersionTagName( versionTag ) })`;
	}

	return wpVersion;
}
