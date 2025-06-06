import type { AppState } from 'calypso/types';

export default function hasGravatarDomainQuery( state: AppState ): boolean {
	return state?.route?.query?.current?.isGravatarDomain === '1';
}
