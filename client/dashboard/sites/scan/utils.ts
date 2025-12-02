import { Threat } from '@automattic/api-core';
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
