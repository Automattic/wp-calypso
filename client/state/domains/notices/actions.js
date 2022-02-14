import wpcom from 'calypso/lib/wp';
import {
	DOMAINS_NOTICES_REQUEST,
	DOMAINS_NOTICES_REQUEST_FAILURE,
	DOMAINS_NOTICES_REQUEST_SUCCESS,
	DOMAINS_NOTICE_UPDATE,
	DOMAINS_NOTICE_UPDATE_FAILURE,
	DOMAINS_NOTICE_UPDATE_SUCCESS,
} from 'calypso/state/action-types';
import 'calypso/state/domains/init';

export const requestDomainsNotices = ( domainName ) => ( dispatch ) => {
	dispatch( {
		type: DOMAINS_NOTICES_REQUEST,
		domainName,
	} );

	return wpcom.req.get( { path: `/me/domains/${ domainName }/notices` } ).then(
		( { states } ) => {
			dispatch( {
				type: DOMAINS_NOTICES_REQUEST_SUCCESS,
				domainName,
				notices: states[ domainName ],
			} );
		},
		( error ) => {
			dispatch( {
				type: DOMAINS_NOTICES_REQUEST_FAILURE,
				domainName,
				error: error.message,
			} );
		}
	);
};

export const updateDomainNotice = ( domainName, notice, value ) => ( dispatch ) => {
	dispatch( { type: DOMAINS_NOTICE_UPDATE, domainName } );

	return wpcom.req
		.post(
			{ path: `/me/domains/${ domainName }/notices/${ notice }/message` },
			{ notice_message: value }
		)
		.then(
			( data ) => {
				if ( data.success ) {
					dispatch( {
						type: DOMAINS_NOTICE_UPDATE_SUCCESS,
						domainName,
						notices: data.states[ domainName ],
					} );
					return true;
				}
			},
			( error ) => {
				dispatch( {
					type: DOMAINS_NOTICE_UPDATE_FAILURE,
					domainName,
					error: error.message,
				} );
				return false;
			}
		);
};
