/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Threat, ThreatFix, ThreatType } from './types';

export function getThreatType( threat: Threat ): ThreatType {
	if ( threat.hasOwnProperty( 'diff' ) ) {
		return 'core';
	}

	if ( threat.hasOwnProperty( 'context' ) ) {
		return 'file';
	}

	if ( threat.hasOwnProperty( 'extension' ) ) {
		// 'plugin' or 'theme'
		const { extension = { type: 'unknown' } } = threat;
		return extension.type;
	}

	if ( threat.hasOwnProperty( 'rows' ) ) {
		return 'database';
	}

	if ( 'Suspicious.Links' === threat.signature ) {
		return 'database';
	}

	return 'none';
}

export const getThreatVulnerability = ( threat: Threat ): string | i18nCalypso.TranslateResult => {
	switch ( getThreatType( threat ) ) {
		case 'core':
			return translate( 'Vulnerability found in WordPress' );

		case 'file':
			return translate( 'Threat found %(signature)s', {
				args: {
					signature: threat.signature,
				},
			} );

		case 'plugin':
			return translate( 'Vulnerability found in plugin' );

		case 'theme':
			return translate( 'Vulnerability found in theme' );

		case 'database':
			return '';

		case 'none':
		default:
			return translate( 'Miscellaneous vulnerability' );
	}
};

export const getThreatFix = ( fixable: ThreatFix ): i18nCalypso.TranslateResult => {
	switch ( fixable.fixer ) {
		case 'replace':
			return translate( 'Jetpack Scan will replace the affected file or directory.' );
		case 'delete':
			return translate( 'Jetpack Scan will delete the affected file or directory.' );
		case 'update':
			return translate( 'Jetpack Scan can update to a newer version (%(version)s).', {
				args: {
					version: fixable.target || 'unknown',
				},
			} );
		default:
			return translate( 'Jetpack Scan will resolve the threat.' );
	}
};
