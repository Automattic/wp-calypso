import config from '@automattic/calypso-config';
import { get } from 'lodash';
import wpcom from 'calypso/lib/wp';
import { domainAvailability } from './constants';

export function checkDomainAvailability( params, onComplete ) {
	const { domainName, blogId } = params;
	const isCartPreCheck = get( params, 'isCartPreCheck', false );
	console.log( ' will check domain availability for ', domainName, blogId, isCartPreCheck );
	if ( ! domainName ) {
		onComplete( null, { status: domainAvailability.EMPTY_QUERY } );
		return;
	}
	wpcom.req
		.get( `/domains/${ encodeURIComponent( domainName ) }/is-available`, {
			blog_id: blogId,
			apiVersion: '1.3',
			is_cart_pre_check: isCartPreCheck,
		} )
		.then( ( data ) => {
			onComplete( null, data );
		} )
		.catch( ( error ) => {
			onComplete( error.error );
		} );
}

export function preCheckDomainAvailability( domain, blogId ) {
	return new Promise( ( resolve ) => {
		console.log( 'will pre check domain availability for ', domain );
		checkDomainAvailability(
			{
				domainName: domain,
				blogId: blogId,
				isCartPreCheck: true,
			},
			( error, result ) => {
				const status = get( result, 'status', error );
				const isAvailable = domainAvailability.AVAILABLE === status;
				const isAvailableSupportedPremiumDomain =
					config.isEnabled( 'domains/premium-domain-purchases' ) &&
					domainAvailability.AVAILABLE_PREMIUM === status &&
					result?.is_supported_premium_domain;
				resolve( {
					status: ! isAvailable && ! isAvailableSupportedPremiumDomain ? status : null,
					trademarkClaimsNoticeInfo: get( result, 'trademark_claims_notice_info', null ),
				} );
			}
		);
	} );
}
