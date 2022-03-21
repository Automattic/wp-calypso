import { translate } from 'i18n-calypso';
import { SignatureComponents, Threat, ThreatFamily, ThreatFix, ThreatType } from './types';
import type { TranslateResult } from 'i18n-calypso';

// This should be temporary since this data should be coming from the api
// and not something that we should change to accommodate the results.
export const getThreatMessage = ( threat: Threat ): string | TranslateResult => {
	const { filename, extension = { slug: 'unknown', version: 'n/a' } } = threat;
	const basename = filename ? filename.replace( /.*\//, '' ) : '';

	switch ( getThreatType( threat ) ) {
		case 'core':
			return translate( 'Compromised WordPress core file: %s', {
				args: [ basename ],
			} );

		case 'file':
			return translate( 'Malicious code found in file: %s', {
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

export const getThreatVulnerability = ( threat: Threat ): string | TranslateResult => {
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

export const getThreatFix = ( fixable: ThreatFix ): TranslateResult => {
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

export const getThreatSignatureComponents = ( threat: Threat ): SignatureComponents | null => {
	// ([signature_id])[language]_[payload]_[family]_[variant]
	const signatureRegex = /(?:\(([^)]+)\))?([^_]+)_([^_]+)_(.+)_(.+)/g;
	const signatureComponents = signatureRegex.exec( threat.signature );

	if ( ! signatureComponents || signatureComponents.length !== 6 ) {
		return null;
	}

	return {
		signature_id: signatureComponents[ 1 ],
		language: signatureComponents[ 2 ],
		payload: signatureComponents[ 3 ],
		family: signatureComponents[ 4 ] as ThreatFamily,
		variant: signatureComponents[ 5 ],
	};
};
