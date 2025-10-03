import { Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import * as React from 'react';
import { getThreatType } from 'calypso/components/jetpack/threat-item/utils';
import ThreatItemSubheader from 'calypso/components/jetpack/threat-item-subheader';
import ThreatSeverityBadge from 'calypso/components/jetpack/threat-severity-badge';
import type { Threat } from 'calypso/components/jetpack/threat-item/types';

import './style.scss';

interface Props {
	threat: Threat;
	// Set isStyled to false if you care about strings only
	isStyled: boolean;
}

const severityClassNames = ( severity: number ) => {
	return {
		'is-critical': severity >= 5,
		'is-high': severity >= 3 && severity < 5,
		'is-low': severity < 3,
	};
};

// This should be temporary since this data should be coming from the api
// and not something that we should change to accommodate the results.
const getThreatMessage = ( threat: Threat ) => {
	const { filename, extension = { slug: 'unknown', version: 'n/a' }, version } = threat;
	const basename = filename ? filename.replace( /.*\//, '' ) : '';

	switch ( getThreatType( threat ) ) {
		case 'core':
			return version
				? translate( 'Vulnerable WordPress version: %s', {
						args: [ version ],
				  } )
				: translate( 'Vulnerable WordPress version.' );

		case 'core_file':
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
				if ( threat.table !== undefined ) {
					return translate( 'The database table %(table)s contains malicious code', {
						args: {
							table: threat.table,
						},
					} );
				}

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
			return <> { translate( 'Threat found' ) } </>;
	}
};

const ThreatItemHeader: React.FC< Props > = ( { threat } ) => {
	return (
		<>
			<div className="threat-item-header__card-container">
				<ThreatSeverityBadge severity={ threat.severity } />
				<div className="threat-item-header__titles">
					<div className="threat-item-header__card-top">{ getThreatMessage( threat ) }</div>
					<div
						className={ clsx(
							'threat-item-header__card-bottom',
							severityClassNames( threat.severity )
						) }
					>
						<ThreatItemSubheader threat={ threat } />
					</div>
				</div>
			</div>
			<div className="threat-item-header__autofix-container">
				{ threat.fixable && (
					/* eslint-disable wpcalypso/jsx-classname-namespace */
					<Gridicon className="threat-item-header__autofix_badge" icon="checkmark" size={ 18 } />
				) }
			</div>
		</>
	);
};

export default ThreatItemHeader;
