import { wpcom } from '../wpcom-fetcher';
import type {
	UserTwoStepAuthSecurityKeys,
	TwoStepAuthSecurityKeyRegistrationChallenge,
	TwoStepAuthSecurityKeyRegistrationChallengeArgs,
	TwoStepAuthAppAuthSetup,
	TwoStepAuthApplicationPassword,
} from './types';

export async function fetchTwoStepAuthSecurityKeys(): Promise< UserTwoStepAuthSecurityKeys > {
	return wpcom.req.get( {
		path: '/me/two-step/security-key/get',
		apiVersion: '1.1',
	} );
}

export async function fetchTwoStepAuthSecurityKeyRegistrationChallenge(
	data: TwoStepAuthSecurityKeyRegistrationChallengeArgs
): Promise< TwoStepAuthSecurityKeyRegistrationChallenge > {
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

export async function fetchTwoStepAuthAppSetup(): Promise< TwoStepAuthAppAuthSetup > {
	return wpcom.req.get( {
		path: '/me/two-step/app-auth-setup',
		apiVersion: '1.1',
	} );
}

export async function fetchTwoStepAuthApplicationPasswords(): Promise<
	TwoStepAuthApplicationPassword[]
> {
	const { application_passwords } = await wpcom.req.get( {
		path: '/me/two-step/application-passwords',
		apiVersion: '1.1',
	} );
	return application_passwords;
}
