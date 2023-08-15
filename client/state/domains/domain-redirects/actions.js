import i18n from 'i18n-calypso';
import wpcom from 'calypso/lib/wp';
import {
	DOMAINS_REDIRECT_FETCH,
	DOMAINS_REDIRECT_FETCH_COMPLETED,
	DOMAINS_REDIRECT_FETCH_FAILED,
	DOMAINS_REDIRECT_NOTICE_CLOSE,
	DOMAINS_REDIRECT_UPDATE,
	DOMAINS_REDIRECT_UPDATE_COMPLETED,
	DOMAINS_REDIRECT_UPDATE_FAILED,
	DOMAINS_REDIRECT_DELETE,
	DOMAINS_REDIRECT_DELETE_COMPLETED,
	DOMAINS_REDIRECT_DELETE_FAILED,
} from 'calypso/state/action-types';

import 'calypso/state/domains/init';

export function closeDomainRedirectNotice( domain ) {
	return {
		type: DOMAINS_REDIRECT_NOTICE_CLOSE,
		domain,
	};
}

export const fetchDomainRedirect = ( domain ) => ( dispatch ) => {
	dispatch( { type: DOMAINS_REDIRECT_FETCH, domain } );

	wpcom.req.get( { path: '/sites/all/domain/' + domain + '/redirects' } ).then(
		( { target_host, target_path, forward_paths, is_secure, domain_redirect_id } ) => {
			dispatch( {
				type: DOMAINS_REDIRECT_FETCH_COMPLETED,
				domain,
				targetHost: target_host,
				targetPath: target_path,
				forwardPaths: forward_paths,
				isSecure: is_secure !== '0' ? true : false,
				domainRedirectId: domain_redirect_id,
			} );
		},
		( error ) => {
			dispatch( {
				type: DOMAINS_REDIRECT_FETCH_FAILED,
				domain,
				error: error
					? error.message
					: i18n.translate(
							'There was a problem retrieving the redirect settings. Please try again later or contact support.'
					  ),
			} );
		}
	);
};

export const updateDomainRedirect =
	( domain, targetHost, targetPath, forwardPaths, isSecure ) => ( dispatch ) => {
		dispatch( { type: DOMAINS_REDIRECT_UPDATE, domain } );

		return wpcom.req
			.post(
				{ path: '/sites/all/domain/' + domain + '/redirects' },
				{
					target_host: targetHost,
					target_path: targetPath,
					is_secure: isSecure,
					forward_paths: true, // Always permanent on v1
					is_permanent: true, // Always permanent on v1
				}
			)
			.then(
				( data ) => {
					if ( data.success ) {
						dispatch( {
							type: DOMAINS_REDIRECT_UPDATE_COMPLETED,
							domain,
							targetHost,
							targetPath,
							forwardPaths,
							isSecure,
							success: i18n.translate( 'The redirect settings were updated successfully.' ),
						} );
						return true;
					}

					dispatch( {
						type: DOMAINS_REDIRECT_UPDATE_FAILED,
						domain,
						error: i18n.translate(
							'There was a problem updating the redirect settings. Please try again later or contact support.'
						),
					} );
					return false;
				},
				( error ) => {
					dispatch( {
						type: DOMAINS_REDIRECT_UPDATE_FAILED,
						domain,
						error: error.message,
					} );
					return false;
				}
			);
	};

export const deleteDomainRedirect = ( domain, domainRedirectId ) => ( dispatch ) => {
	dispatch( { type: DOMAINS_REDIRECT_DELETE, domain } );

	return wpcom.req
		.post(
			{ path: '/sites/all/domain/' + domain + '/redirects/delete' },
			{
				domain_redirect_id: domainRedirectId,
			}
		)
		.then(
			( data ) => {
				if ( data.success ) {
					dispatch( {
						type: DOMAINS_REDIRECT_DELETE_COMPLETED,
						domain,
						success: i18n.translate( 'The redirect settings were deleted successfully.' ),
					} );
					return true;
				}

				dispatch( {
					type: DOMAINS_REDIRECT_DELETE_FAILED,
					domain,
					error: i18n.translate(
						'There was a problem deleting the redirect settings. Please try again later or contact support.'
					),
				} );
				return false;
			},
			( error ) => {
				dispatch( {
					type: DOMAINS_REDIRECT_DELETE_FAILED,
					domain,
					error: error.message,
				} );
				return false;
			}
		);
};
