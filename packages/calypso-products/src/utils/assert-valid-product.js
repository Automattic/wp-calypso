/**
 * External dependencies
 */
import { difference, isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import schema from './schema.json';

export function assertValidProduct( product ) {
	const missingAttributes = difference( schema.required, Object.keys( product ) );

	if ( ! isEmpty( missingAttributes ) ) {
		throw new Error(
			'Missing required attributes for ProductValue: [' + missingAttributes.join( ', ' ) + ']'
		);
	}
}
