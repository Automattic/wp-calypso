import config from '@automattic/calypso-config';
import { logToLogstash } from 'calypso/lib/logstash';
import type { ApiError } from './types';

type Step = 'create-token' | 'status' | 'approve';

export function logQrAppLoginError( step: Step, error: ApiError ): void {
	logToLogstash( {
		feature: 'calypso_client',
		message: `qr-code-app-login: ${ step } failed`,
		severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
		extra: {
			env: config( 'env_id' ),
			type: 'qr_code_app_login',
			step,
			code: error.code ?? 'unknown',
			message: error.message,
		},
	} );
}
