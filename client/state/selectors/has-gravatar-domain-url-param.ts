import type { AppState } from 'calypso/types';

export default function hasGravatarDomainUrlParam( state: AppState ): boolean {
	return state?.route?.query?.current?.isGravatarDomain === '1';
}
