import { translate } from 'i18n-calypso';
import { Threat, ThreatFix, ThreatType } from './types';

// This should be temporary since this data should be coming from the api
// and not something that we should change to accommodate the results.
export const getThreatMessage = ( threat: Threat ): string | i18nCalypso.TranslateResult => {
	const { filename, extension = { slug: 'unknown', version: 'n/a' } } = threat;
	const basename = filename ? filename.replace( /.*\//, '' ) : '';

	switch ( getThreatType( threat ) ) {
		case 'core':
			return translate( 'Infected core file: %s', {
				args: [ basename ],
			} );

		case 'file':
			return translate( 'File contains malicious code: %s', {
				args: [ basename ],
			} );

		case 'plugin':
			return translate( 'Vulnerable Plugin: %(pluginSlug)s (version %(version)s)', {
				args: {
					pluginSlug: extension.slug,
					version: extension.version,
				},
			} );

		case 'theme':
			return translate( 'Vulnerable Theme %(themeSlug)s (version %(version)s)', {
				args: {
					themeSlug: extension.slug,
					version: extension.version,
				},
			} );

		case 'database':
			if ( ! threat.rows ) {
				return translate( 'Database threat' );
			}
			return translate(
				'Database threat on table %(threatTable)s affecting %(threatCount)d row ',
				'Database threat on %(threatTable)s affecting %(threatCount)d rows',
				{
					count: Object.keys( threat.rows ).length,
					args: {
						threatCount: Object.keys( threat.rows ).length,
						threatTable: threat.table,
					},
				}
			);

		case 'none':
		default:
			return translate( 'Threat found' );
	}
};

export function getThreatType( threat: Threat ): ThreatType {
	// We can't use `hasOwnProperty` here to test these conditions because
	// the object might contains those keys with an undefined value
	if ( threat.diff !== undefined ) {
		return 'core';
	}

	if ( threat.context !== undefined ) {
		return 'file';
	}

	if ( threat.extension !== undefined ) {
		// 'plugin' or 'theme'
		const { extension = { type: 'unknown' } } = threat;
		return extension.type;
	}

	if ( threat.rows !== undefined ) {
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
			return 'Vulnerability found in database table';

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
			if ( fixable.target ) {
				return translate( 'Jetpack Scan will update to a newer version (%(version)s).', {
					args: {
						version: fixable.target,
					},
				} );
			}
			return translate( 'Jetpack Scan will update to a newer version.' );
		case 'edit':
			return translate( 'Jetpack Scan will edit the affected file or directory.' );
		case 'rollback':
			if ( fixable.target ) {
				return translate(
					'Jetpack Scan will rollback the affected file to the version from %(version)s.',
					{
						args: {
							version: fixable.target,
						},
					}
				);
			}
			return translate(
				'Jetpack Scan will rollback the affected file to an older (clean) version.'
			);
		default:
			return translate( 'Jetpack Scan will resolve the threat.' );
	}
};
