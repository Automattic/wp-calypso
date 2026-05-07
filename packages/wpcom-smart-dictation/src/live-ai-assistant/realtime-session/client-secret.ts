import wpcomRequest from 'wpcom-proxy-request';
import { REALTIME_CLIENT_SECRETS_PATH } from './constants';

interface FetchEphemeralKeyArgs {
	model: string;
	instructions: string;
}

function extractClientSecretValue( data: unknown ): string {
	const body = data as { client_secret?: { value?: string }; value?: string; token?: string };
	const value = body.client_secret?.value ?? body.value ?? body.token;
	return value ?? '';
}

export async function fetchEphemeralKey( {
	model,
	instructions,
}: FetchEphemeralKeyArgs ): Promise< string > {
	const response = await wpcomRequest( {
		path: REALTIME_CLIENT_SECRETS_PATH,
		method: 'POST',
		apiNamespace: 'wpcom/v2',
		headers: {
			'X-WPCOM-AI-Feature': 'wpcom-dictation-tool',
		},
		body: {
			session: {
				type: 'realtime',
				model,
				instructions,
			},
		},
	} );
	return extractClientSecretValue( response );
}
