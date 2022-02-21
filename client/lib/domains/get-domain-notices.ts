import wpcom from 'calypso/lib/wp';

interface GetDomainNoticesResponseDataSuccess {
	success: boolean;
	states: {
		[ domainName: string ]: {
			[ domainNotice: string ]: string;
		};
	};
}

interface GetDomainNoticesResponseDataError {
	code?: string;
	message?: string;
}

export function getDomainNotices(
	domainName: string,
	onComplete: ( data: GetDomainNoticesResponseDataSuccess ) => void,
	onError: ( error: GetDomainNoticesResponseDataError ) => void
) {
	wpcom.req
		.get( { path: `/me/domains/${ domainName }/notices` } )
		.then( ( data: GetDomainNoticesResponseDataSuccess ) => onComplete( data ) )
		.catch( ( error: GetDomainNoticesResponseDataError ) => onError( error ) );
}
