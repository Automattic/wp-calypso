import { wpcom } from '../wpcom-fetcher';

export async function validateSecurityKeyRegistration(
	data: Record< string, unknown >
): Promise< Record< string, unknown > > {
	return wpcom.req.post( {
		path: '/me/two-step/security-key/registration_validate',
		apiVersion: '1.1',
		body: data,
	} );
}
