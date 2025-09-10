import { wpcom } from '../wpcom-fetcher';
import type {
	DeleteSecurityKeyArgs,
	ValidateSecurityKeyRegistrationArgs,
	CreateApplicationPasswordArgs,
	CreateApplicationPasswordResponse,
} from './types';

export async function validateSecurityKeyRegistration(
	data: ValidateSecurityKeyRegistrationArgs
): Promise< Record< string, unknown > > {
	return wpcom.req.post( {
		path: '/me/two-step/security-key/registration_validate',
		apiVersion: '1.1',
		body: data,
	} );
}

export async function deleteSecurityKey(
	data: DeleteSecurityKeyArgs
): Promise< Record< string, unknown > > {
	return wpcom.req.get(
		{
			path: '/me/two-step/security-key/delete',
			apiVersion: '1.1',
		},
		{
			...data,
		}
	);
}

export async function createApplicationPassword(
	data: CreateApplicationPasswordArgs
): Promise< CreateApplicationPasswordResponse > {
	return wpcom.req.post( {
		path: '/me/two-step/application-passwords/new',
		apiVersion: '1.1',
		body: data,
	} );
}

export async function deleteApplicationPassword(
	applicationPasswordId: string
): Promise< Record< string, unknown > > {
	return wpcom.req.post( {
		path: `/me/two-step/application-passwords/${ applicationPasswordId }/delete`,
		apiVersion: '1.1',
	} );
}
