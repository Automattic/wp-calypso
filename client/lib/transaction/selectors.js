/**
 * External dependencies
 */
import { isEmpty } from 'lodash';

export function hasDomainDetails( transaction ) {
	return ! isEmpty( transaction.domainDetails );
}
