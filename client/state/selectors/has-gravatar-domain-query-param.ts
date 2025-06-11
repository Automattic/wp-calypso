import type { AppState } from 'calypso/types';

export default function hasGravatarDomainQueryParam( state: AppState ): boolean {
	return state?.route?.query?.current?.isGravatarDomain === '1';
}
