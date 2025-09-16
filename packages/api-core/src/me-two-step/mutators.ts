import { wpcom } from '../wpcom-fetcher';
import type {
	DeleteTwoStepAuthSecurityKeyArgs,
	ValidateTwoStepAuthSecurityKeyRegistrationArgs,
	CreateTwoStepAuthApplicationPasswordArgs,
	CreateTwoStepAuthApplicationPasswordResponse,
	ValidateTwoStepAuthCodeArgs,
	GenerateTwoStepAuthBackupCodesResponse,
} from './types';

export async function validateTwoStepAuthSecurityKeyRegistration(
	data: ValidateTwoStepAuthSecurityKeyRegistrationArgs
): Promise< Record< string, unknown > > {
	return wpcom.req.post( {
		path: '/me/two-step/security-key/registration_validate',
		apiVersion: '1.1',
		body: data,
	} );
}

export async function deleteTwoStepAuthSecurityKey(
	data: DeleteTwoStepAuthSecurityKeyArgs
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

export async function validateTwoStepAuthCode(
	data: ValidateTwoStepAuthCodeArgs
): Promise< Record< string, unknown > > {
	return wpcom.req.post( {
		path: '/me/two-step/validate',
		apiVersion: '1.1',
		body: data,
	} );
}

export async function createTwoStepAuthApplicationPassword(
	data: CreateTwoStepAuthApplicationPasswordArgs
): Promise< CreateTwoStepAuthApplicationPasswordResponse > {
	return wpcom.req.post( {
		path: '/me/two-step/application-passwords/new',
		apiVersion: '1.1',
		body: data,
	} );
}

export async function generateTwoStepAuthBackupCodes(): Promise< GenerateTwoStepAuthBackupCodesResponse > {
	return wpcom.req.post( {
		path: '/me/two-step/backup-codes/new',
		apiVersion: '1.1',
	} );
}

export async function deleteTwoStepAuthApplicationPassword(
	applicationPasswordId: string
): Promise< Record< string, unknown > > {
	return wpcom.req.post( {
		path: `/me/two-step/application-passwords/${ applicationPasswordId }/delete`,
		apiVersion: '1.1',
	} );
}

export async function sendTwoStepAuthSMSCode(): Promise< Record< string, unknown > > {
	return wpcom.req.post( {
		path: '/me/two-step/sms/new',
		apiVersion: '1.1',
	} );
}
