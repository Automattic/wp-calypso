import wpcom from 'calypso/lib/wp';
import { DomainsApiError, SetDomainNoticeResponseDataSuccess } from './types';

export function setDomainNotice(
	domainName: string,
	noticeType: string,
	noticeValue: string,
	onComplete?: ( data: SetDomainNoticeResponseDataSuccess ) => void,
	onError?: ( error: DomainsApiError ) => void
) {
	wpcom.req
		.post(
			{ path: `/me/domains/${ domainName }/notices/${ noticeType }/message` },
			{ notice_message: noticeValue }
		)
		.then( ( data: SetDomainNoticeResponseDataSuccess ) => onComplete?.( data ) )
		.catch( ( error: DomainsApiError ) => onError?.( error ) );
}
