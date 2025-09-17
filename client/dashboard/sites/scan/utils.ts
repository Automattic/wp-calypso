import { Threat } from '@automattic/api-core';
import { sprintf, __, _n } from '@wordpress/i18n';
import { wordpress, code, plugins, brush, blockTable, warning } from '@wordpress/icons';

export function getThreatType(
	threat: Threat
): 'core' | 'core_file' | 'file' | 'plugin' | 'theme' | 'database' | 'none' | string {
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

export const getThreatMessage = ( threat: Threat ): string => {
	const { filename, extension = { slug: 'unknown', version: 'n/a' }, version } = threat;
	const basename = filename ? filename.replace( /.*\//, '' ) : '';

	switch ( getThreatType( threat ) ) {
		case 'core':
			return sprintf(
				/** translators: %s: Vulnerable WordPress version */
				__( 'Vulnerable WordPress version: %s' ),
				version
			);

		case 'core_file':
			return sprintf(
				/** translators: %s: filename */
				__( 'Infected core file: %s' ),
				basename
			);

		case 'file':
			return sprintf(
				/** translators: %s: filename */
				__( 'File contains malicious code: %s' ),
				basename
			);
		case 'plugin':
			return sprintf(
				/* translators: %1$s: plugin slug, %2$s: plugin version */
				__( 'Vulnerable Plugin: %1$s (version %2$s)' ),
				extension.slug,
				extension.version
			);
		case 'theme':
			return sprintf(
				/* translators: %1$s: theme slug, %2$s: theme version */
				__( 'Vulnerable Theme: %1$s (version %2$s)' ),
				extension.slug,
				extension.version
			);
		case 'database': {
			if ( ! threat.rows ) {
				if ( threat.table !== undefined ) {
					return sprintf(
						/** translators: %s: table name */
						__( 'The database table %s contains malicious code' ),
						threat.table
					);
				}

				return __( 'Database threat' );
			}

			const rowCount = Object.keys( threat.rows ).length;
			return sprintf(
				/* translators: %1$s: table name, %2$d: number of rows */
				_n(
					'Database threat on table %1$s affecting %2$d row',
					'Database threat on table %1$s affecting %2$d rows',
					rowCount
				),
				threat.table,
				rowCount
			);
		}

		default:
			return __( 'Threat found' );
	}
};

export const getThreatIcon = ( threat: Threat ) => {
	const type = getThreatType( threat );

	switch ( type ) {
		case 'core':
		case 'core_file':
			return wordpress;
		case 'file':
			return code;
		case 'plugin':
			return plugins;
		case 'theme':
			return brush;
		case 'database':
			return blockTable;
		case 'none':
		default:
			return warning;
	}
};
