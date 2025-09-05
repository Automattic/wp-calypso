import { wpcom } from '../wpcom-fetcher';
import type { UserSecurityKeys, SecurityKeyRegistrationChallenge } from './types';

export async function fetchSecurityKeys(): Promise< UserSecurityKeys > {
	return wpcom.req.get( {
		path: '/me/two-step/security-key/get',
		apiVersion: '1.1',
	} );
}

export async function fetchSecurityKeyRegistrationChallenge(
	data: Record< string, unknown >
): Promise< SecurityKeyRegistrationChallenge > {
	return wpcom.req.get(
		{
			path: '/me/two-step/security-key/registration_challenge',
			apiVersion: '1.1',
		},
		{
			...data,
		}
	);
}
