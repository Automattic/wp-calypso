import { translate } from 'i18n-calypso';
import { SignatureComponents, Threat, ThreatFix, ThreatType } from './types';
import type { TranslateResult } from 'i18n-calypso';

export const getThreatSignatureComponents = ( threat: Threat ): SignatureComponents | null => {
	// ([signatureId])?[language]_[payload]_[family]_[variant]
	const signatureRegex = /(?:\(([^)]+)\))?([^_]+)_([^_]+)_(.+)_(.+)/g;
	const signatureRegexResult = signatureRegex.exec( threat.signature );

	if ( ! signatureRegexResult || signatureRegexResult.length !== 6 ) {
		return null;
	}

	const [ signatureId, language, payload, family, variant ] = signatureRegexResult.slice( 1 );

	return {
		signatureId,
		language,
		payload,
		family,
		variant,
	};
};

// This should be temporary since this data should be coming from the api
// and not something that we should change to accommodate the results.
export const getThreatMessage = ( threat: Threat ): string | TranslateResult => {
	const { filename, extension = { slug: 'unknown', version: 'n/a' }, version } = threat;
	const basename = filename ? filename.replace( /.*\//, '' ) : '';

	switch ( getThreatType( threat ) ) {
		case 'core':
			return version
				? translate( 'The installed version of WordPress (%s) has a known vulnerability.', {
						args: [ version ],
				  } )
				: translate( 'The installed version of WordPress has a known vulnerability.' );

		case 'core_file':
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
						threatTable: threat.table as string,
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
		return 'core_file';
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

	if ( threat.table !== undefined ) {
		return 'database';
	}

	if ( 'Suspicious.Links' === threat.signature ) {
		return 'database';
	}

	if ( 'Vulnerable.WP.Core' === threat.signature ) {
		return 'core';
	}

	return 'none';
}

export const getThreatVulnerability = ( threat: Threat ): string | TranslateResult => {
	switch ( getThreatType( threat ) ) {
		case 'core':
		case 'core_file':
			return translate( 'Vulnerability found in WordPress' );

		case 'file':
			return translate( 'Threat found %(signature)s', {
				args: {
					signature: threat.signature,
				},
			} );

		case 'plugin':
			return translate( 'Vulnerability found in a plugin' );

		case 'theme':
			return translate( 'Vulnerability found in a theme' );

		case 'database':
			if ( threat.signature !== undefined ) {
				return translate( 'Thread found: %(signature)s', {
					args: {
						signature: threat.signature,
					},
				} );
			}
			if ( threat.table !== undefined ) {
				return translate( 'The database table %(table)s contains malicious code', {
					args: {
						table: threat.table,
					},
				} );
			}
			return 'Vulnerability found in a database table';

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

export const getThreatPayloadSubtitle = ( threat: Threat ): TranslateResult | undefined => {
	const threatComponents = getThreatSignatureComponents( threat );
	if ( ! threatComponents ) {
		return;
	}

	switch ( threatComponents.payload ) {
		case 'backdoor':
			return translate( 'Backdoor found on your site. Please take immediate action.' );
		case 'ccskimmers':
			return translate(
				'Jetpack found a credit card skimmer script on your website, your attention is required.'
			);
		case 'cryptominer':
			return translate(
				'Jetpack found a cryptominer script on your website, your attention is required.'
			);
		case 'dropper':
			return translate(
				'Malicious code known to upload malware to servers was found on your site. Please take immediate action.'
			);
		case 'generic':
			return translate(
				'A potentially malicious file was found on your site. Please review its code.'
			);
		case 'hacktool':
			return translate( 'A hacktool was found on your site. Please take immediate action.' );
		case 'hardening':
			return translate(
				'A misconfigured or a potentially vulnerable tool was found on your site. Please take immediate action.'
			);
		case 'malware':
			return translate( 'Malware was found on your site. Please take immediate action.' );
		case 'malvertising':
			return translate(
				'A file loading a malicious ad was found on your site. Please take immediate action.'
			);
		case 'phishing':
			return translate( 'A phishing page was found on your site. Please take immediate action.' );
		case 'redirect':
			return translate(
				'Your website is redirecting users to unwanted destinations. Please take immediate action.'
			);
		case 'seospam':
			return translate( 'SEO spam was found on your site. Please take immediate action.' );
		case 'suspicious':
			return translate(
				'Suspicious code was found on your site. We recommend you review it and take proper action.'
			);
		case 'uploader':
			return translate(
				'A malicious file with upload capabilities was found on your site. Please take immediate action.'
			);
		case 'webshell':
			return translate( 'A webshell was found on your site. Please take immediate action.' );
		default:
			return;
	}
};

export const getThreatPayloadDescription = ( threat: Threat ): TranslateResult | undefined => {
	const threatComponents = getThreatSignatureComponents( threat );

	if ( ! threatComponents ) {
		return;
	}

	switch ( threatComponents.payload ) {
		case 'backdoor':
			return translate(
				'Backdoors are pieces of code that allows unauthorized users to run arbitrary code on a website. It has fewer functions than a webshell, usually just one at a time.'
			);
		case 'ccskimmers':
			return translate(
				"Credit card skimmers, or CCSkimmers for short, as the name already defines, are malicious code, usually written in JavaScript or PHP that will monitor website's visitors' requests in order to capture payment information."
			);
		case 'cryptominer':
			return translate(
				"Cryptominers are either JavaScript code that will use the website visitors's computing power, or server runnable code that will mine for cryptocurrencies. Although there are valid cases for this use, most of them are the result of a website compromise."
			);
		case 'dropper':
			return translate(
				'Droppers, as the name implies, are malicious code known to drop an arbitrary file on the affected server. This file may contain other types of malware. Usually the source path of the dropped file is hardcoded or randomly generated.'
			);
		case 'generic':
			return translate(
				'Sometimes Jetpack has enough information to pinpoint a file as malicious. It may happen due to the presence of common Indicators of Compromise for malware. However, since the final payload is unknown, the classification is generic.'
			);
		case 'hacktool':
			return translate(
				'Hacktools are uploaded to compromised sites in order to leverage other types of attacks to the server, to attack other servers, sites or the visitors. Common types of hacktools are mailers, ddos tools, rogue IRC servers and exploit kits.'
			);
		case 'hardening':
			return translate(
				'Jetpack found that your site is hosting a tool that, if misconfigured, may lead to your site to be compromised.'
			);
		case 'malware':
			return translate(
				"Sometimes the code is so heavily obfuscated that it's hard to tell what are the final intentions of it, however, Jetpack Scan team's experience allows them to pinpoint the most common indicators and alert when something is wrong."
			);
		case 'malvertising':
			return translate(
				'Malvertising is the combination of the words Malicious and Advertising, this type of malware will inject rogue ad campaigns to the website, loading unwanted banners, pop-ups, or pop-unders, and even exploit kits targeting visitors.'
			);
		case 'phishing':
			return translate(
				'Phishing scams are well crafted pages or websites made to perfectly emulate a valid service in order to collect valuable information from the victims. It may target bank accounts, popular streaming services, and even postal offices.'
			);
		case 'redirect':
			return translate(
				'Malicious code may be installed on a compromised website to redirect visitors to unwanted destinations. Those can be websites running exploit kits, phishing or fake sites, or just sites the attacker is affiliated with and will give them money based on visits.'
			);
		case 'seospam':
			return translate(
				"Compromised websites may be used by attackers to act as part of a link farm; this is done to increase a website's Search Engine rank and causes harm on the affected sites."
			);
		case 'suspicious':
			return translate(
				"Sometimes Jetpack has enough information to pinpoint a file as potentially malicious. Or at least suspicious. This may happen due to the presence of common Indicators of Compromise for malware. However, since we don't have much information to classify it on a proper type, we recommend you review the code."
			);
		case 'uploader':
			return translate(
				'Attackers may upload a specific type of hacktool to a compromised website that will allow them to maintain access. Those tools we call Uploaders will serve only one purpose: upload files to the site.'
			);
		case 'webshell':
			return translate(
				'Webshells are complex tools that will give full control over the compromised website, and sometimes the server, to the attacker. They are known to have a nice interface and many functions.'
			);
		default:
			return;
	}
};
