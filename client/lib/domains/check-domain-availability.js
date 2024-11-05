import { get } from 'lodash';
import wpcom from 'calypso/lib/wp';
import { domainAvailability } from './constants';

export function checkDomainAvailability( params, onComplete ) {
	const { domainName, blogId } = params;
	const isCartPreCheck = get( params, 'isCartPreCheck', false );
	if ( ! domainName ) {
		onComplete( null, { status: domainAvailability.EMPTY_QUERY } );
		return;
	}
	wpcom.req
		.get( `/domains/${ encodeURIComponent( domainName ) }/is-available`, {
			blog_id: blogId,
			apiVersion: '1.3',
			is_cart_pre_check: isCartPreCheck,
			vendor: params.vendor ?? null,
		} )
		.then( ( data ) => {
			onComplete( null, data );
		} )
		.catch( ( error ) => {
			onComplete( error.error );
		} );
}
