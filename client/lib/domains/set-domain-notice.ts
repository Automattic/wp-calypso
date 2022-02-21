import wpcom from 'calypso/lib/wp';

interface SetDomainNoticeResponseDataSuccess {
	success: boolean;
	states: {
		[ domainName: string ]: {
			[ domainNotice: string ]: string;
		};
	};
}

interface SetDomainNoticeResponseDataError {
	code?: string;
	message?: string;
}

export function setDomainNotice(
	domainName: string,
	noticeType: string,
	noticeValue: string,
	onComplete: ( data: SetDomainNoticeResponseDataSuccess ) => void,
	onError: ( error: SetDomainNoticeResponseDataError ) => void
) {
	wpcom.req
		.post(
			{ path: `/me/domains/${ domainName }/notices/${ noticeType }/message` },
			{ notice_message: noticeValue }
		)
		.then( ( data: SetDomainNoticeResponseDataSuccess ) => onComplete( data ) )
		.catch( ( error: SetDomainNoticeResponseDataError ) => onError( error ) );
}
