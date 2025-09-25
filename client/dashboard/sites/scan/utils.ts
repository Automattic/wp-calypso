import { Threat } from '@automattic/api-core';
import { __, sprintf } from '@wordpress/i18n';
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

export const getThreatFix = ( threat: Threat ) => {
	const { fixable } = threat;

	if ( ! fixable ) {
		return null;
	}

	switch ( fixable.fixer ) {
		case 'replace':
			return __( 'Jetpack Scan will replace the affected file or directory.' );
		case 'delete':
			return __( 'Jetpack Scan will delete the affected file or directory.' );
		case 'update':
			if ( fixable.target ) {
				return sprintf(
					/** translators: %s: version */
					__( 'Jetpack Scan will update to a newer version (%s).' ),
					fixable.target
				);
			}
			return __( 'Jetpack Scan will update to a newer version.' );
		case 'edit':
			return __( 'Jetpack Scan will edit the affected file or directory.' );
		case 'rollback':
			if ( fixable.target ) {
				return sprintf(
					/** translators: %s: version */
					__( 'Jetpack Scan will rollback the affected file to the version from %s.' ),
					fixable.target
				);
			}
			return __( 'Jetpack Scan will rollback the affected file to an older (clean) version.' );
		default:
			return __( 'Jetpack Scan will resolve the threat.' );
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

export function sortSeverity( a: Threat, b: Threat, direction: 'asc' | 'desc' ): number {
	// Custom sort to use numeric severity values instead of string labels
	// Higher severity numbers (5=Critical, 4-3=High, 1-2=Low) should sort first
	const diff = b.severity - a.severity;
	return direction === 'asc' ? -diff : diff;
}
