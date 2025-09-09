import { wpcom } from '../wpcom-fetcher';
import type {
	UserSecurityKeys,
	SecurityKeyRegistrationChallenge,
	SecurityKeyRegistrationChallengeArgs,
	ApplicationPasswords,
} from './types';

export async function fetchSecurityKeys(): Promise< UserSecurityKeys > {
	return wpcom.req.get( {
		path: '/me/two-step/security-key/get',
		apiVersion: '1.1',
	} );
}

export async function fetchSecurityKeyRegistrationChallenge(
	data: SecurityKeyRegistrationChallengeArgs
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

export async function fetchApplicationPasswords(): Promise< ApplicationPasswords > {
	return wpcom.req.get( {
		path: '/me/two-step/application-passwords',
		apiVersion: '1.1',
	} );
}
