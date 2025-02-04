import { TranslateResult, translate } from 'i18n-calypso';
import { filePathValidator } from 'calypso/lib/validation';
import { checkHostInput } from './utils';

export enum FormMode {
	Password,
	PrivateKey,
}

export interface Credentials {
	type: 'ssh' | 'ftp' | 'dynamic-ssh';
	site_url: string;
	host: string;
	port: number | '';
	user: string;
	path: string;
	role: string;
}

export interface FormState {
	protocol: 'ssh' | 'ftp' | 'dynamic-ssh';
	host: string;
	site_url: string;
	port: number | '';
	user: string;
	pass: string;
	path: string;
	kpri: string;
	role: string;
	save_as_staging: boolean;
}

export const INITIAL_FORM_STATE: FormState = {
	protocol: 'ftp',
	host: '',
	port: 21,
	user: '',
	pass: '',
	path: '',
	kpri: '',
	site_url: '',
	role: 'main',
	save_as_staging: false,
};

export interface FormInteractions {
	host: boolean;
	port: boolean;
	user: boolean;
	pass: boolean;
	path: boolean;
	kpri: boolean;
	site_url: boolean;
	role: boolean;
	save_as_staging: boolean;
}

export const INITIAL_FORM_INTERACTION: FormInteractions = {
	host: false,
	port: false,
	user: false,
	pass: false,
	path: false,
	kpri: false,
	site_url: false,
	role: false,
	save_as_staging: false,
};

interface Error {
	message: TranslateResult;
	waitForInteraction: boolean;
}
export interface FormErrors {
	protocol?: Error;
	host?: Error;
	site_url?: Error;
	port?: Error;
	user?: Error;
	pass?: Error;
	path?: Error;
	kpri?: Error;
}

export const INITIAL_FORM_ERRORS: FormErrors = {};

export const validate = ( formState: FormState, mode: FormMode ): FormErrors => {
	const formErrors: FormErrors = {};
	// user checking
	if ( ! formState.user ) {
		formErrors.user = {
			message: translate( 'Please enter your server username.' ),
			waitForInteraction: true,
		};
	} else if ( 'root' === formState.user ) {
		formErrors.user = {
			message: translate(
				"We can't accept credentials for the root user. " +
					'Please provide or create credentials for another user with access to your server.'
			),
			waitForInteraction: true,
		};
	}
	// base url checking for alternate credentials
	if ( formState.role === 'alternate' && ! formState.site_url ) {
		formErrors.site_url = {
			message: translate( 'Please enter a valid destination site url.' ),
			waitForInteraction: true,
		};
	}
	// host checking
	if ( ! formState.host || ! checkHostInput( formState.host ) ) {
		formErrors.host = {
			message: translate( 'Please enter a valid server address.' ),
			waitForInteraction: true,
		};
	}
	// port checking
	if ( typeof formState.port === 'string' ) {
		formErrors.port = {
			message: translate( 'Please enter a valid port number.' ),
			waitForInteraction: true,
		};
	}

	const pathValidationResult = filePathValidator( formState.path );
	if ( formState.path !== '' && pathValidationResult !== null ) {
		formErrors.path = {
			message: pathValidationResult.message,
			waitForInteraction: true,
		};
	}

	if ( FormMode.Password === mode && ! formState.pass ) {
		formErrors.pass = {
			message: translate( 'Please enter your server password.' ),
			waitForInteraction: true,
		};
	}

	if ( FormMode.PrivateKey === mode && ! formState.kpri ) {
		formErrors.kpri = {
			message: translate( 'Please enter your private key.' ),
			waitForInteraction: true,
		};
	}

	return formErrors;
};
