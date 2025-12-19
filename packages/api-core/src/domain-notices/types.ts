export type SetDomainNoticeResponse = {
	success: boolean;
	states: {
		[ domainName: string ]: {
			[ domainNotice: string ]: string;
		};
	};
};
