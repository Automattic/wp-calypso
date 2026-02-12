import { wpcom } from '../wpcom-fetcher';
import type { SetDomainNoticeResponse } from './types';

export function setDomainNotice(
	domainName: string,
	noticeType: string,
	noticeMessage: string
): Promise< SetDomainNoticeResponse > {
	return wpcom.req.post( {
		path: `/me/domains/${ domainName }/notices/${ noticeType }/message`,
		body: {
			notice_message: noticeMessage,
		},
	} );
}
