/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Threat } from 'landing/jetpack-cloud/components/threat-item/types';
import { getThreatType } from 'landing/jetpack-cloud/components/threat-item/threat';

interface Props {
	threat: Threat;
}

// This should be temporary since this data should be coming from the api
// and not something that we should change to accommodate the results.
const ThreatItemHeader = ( { threat }: Props ): i18nCalypso.TranslateResult => {
	const { filename, extension = { slug: 'unknown', version: 'n/a' } } = threat;

	const basename = filename ? filename.replace( /.*\//, '' ) : '';

	switch ( getThreatType( threat ) ) {
		case 'core':
			return translate( 'Infected core file: {{filename/}} ', {
				components: {
					filename: <code className="threat-item-header__alert-filename">{ basename }</code>,
				},
			} );

		case 'file':
			return translate( 'The file {{filename/}} contains a malicious code pattern.', {
				components: {
					filename: <code className="threat-item-header__alert-filename">{ basename }</code>,
				},
			} );

		case 'plugin':
			return translate( 'Vulnerable Plugin: {{pluginSlug/}} (version {{version/}})', {
				components: {
					pluginSlug: <span className="threat-item-header__alert-slug">{ extension.slug }</span>,
					version: <span className="threat-item-header__alert-version">{ extension.version }</span>,
				},
			} );

		case 'theme':
			return translate( 'Vulnerable Theme {{themeSlug/}} (version {{version/}})', {
				components: {
					themeSlug: <span className="threat-item-header__alert-slug">{ extension.slug }</span>,
					version: <span className="threat-item-header__alert-version">{ extension.version }</span>,
				},
			} );

		case 'database':
			if ( ! threat.rows ) {
				return translate( 'Database threat' );
			}
			return translate( 'Database %(threatCount)d threat', 'Database %(threatCount)d threats', {
				count: Object.keys( threat.rows ).length,
				args: {
					threatCount: Object.keys( threat.rows ).length,
				},
			} );

		case 'none':
		default:
			return translate( 'Threat found' );
	}
};

export default ThreatItemHeader;
