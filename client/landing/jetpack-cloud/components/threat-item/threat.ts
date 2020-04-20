/**
 * Internal dependencies
 */
import { Threat, ThreatType } from './types';

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
