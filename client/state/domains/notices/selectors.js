import initialNoticeState from './initial';

export function getDomainNoticeStates( state, domainName ) {
	return state.domains?.notices[ domainName ] || initialNoticeState;
}
