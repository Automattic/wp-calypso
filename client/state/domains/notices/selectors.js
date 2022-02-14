import 'calypso/state/domains/init';

export function getDomainNotice( state, domainName, noticeType ) {
	return state.domains.notices[ domainName ]?.items?.[ noticeType ] || null;
}

export function isRequestingDomainNotices( state, domainName ) {
	return state.domains.notices[ domainName ]?.isFetching || null;
}
