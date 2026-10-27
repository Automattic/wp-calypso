import { __ } from '@wordpress/i18n';
import { canSwitchWordPressVersion } from '../sites/features';
import type { Site } from '@automattic/api-core';

function getWordPressVersionTagName( versionTag: string ) {
	if ( versionTag === 'latest' ) {
		return __( 'Stable' );
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
		wpVersion = `${ getWordPressVersionTagName( versionTag ) } (${ wpVersion })`;
	}

	return wpVersion;
}

/** "7.2" for "7.2-RC1" or "7.2.1". */
export function getMajorWordPressVersion( wpVersion: string ) {
	return wpVersion.match( /^\d+\.\d+/ )?.[ 0 ] ?? wpVersion;
}

/** "7.2 Beta" for "7.2-beta2" and "7.2 RC" for "7.2-RC1", as WordPress names its pre-releases. */
export function getWordPressPrereleaseName( wpVersion: string ) {
	const majorVersion = getMajorWordPressVersion( wpVersion );
	if ( /-rc/i.test( wpVersion ) ) {
		return `${ majorVersion } RC`;
	}
	if ( /-beta/i.test( wpVersion ) ) {
		return `${ majorVersion } Beta`;
	}
	return majorVersion;
}
