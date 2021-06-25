/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';
import { domainAvailability } from './constants';

export function checkDomainAvailability( params, onComplete ) {
	const { domainName, blogId } = params;
	const isCartPreCheck = get( params, 'isCartPreCheck', false );
	if ( ! domainName ) {
		onComplete( null, { status: domainAvailability.EMPTY_QUERY } );
		return;
	}

	wpcom
		.undocumented()
		.isDomainAvailable( domainName, blogId, isCartPreCheck, function ( serverError, result ) {
			if ( serverError ) {
				onComplete( serverError.error );
				return;
			}

			onComplete( null, result );
		} );
}
