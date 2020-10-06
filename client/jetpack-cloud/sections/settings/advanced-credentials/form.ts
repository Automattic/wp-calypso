/**
 * External dependencies
 */
import { TranslateResult } from 'i18n-calypso';

export interface FormState {
	protocol: 'ssh' | 'ftp';
	host: string;
	port: string;
	user: string;
	pass: string;
	path: string;
	kpri: string;
}

export interface FormErrors {
	protocol?: TranslateResult;
	host?: TranslateResult;
	port?: TranslateResult;
	user?: TranslateResult;
	pass?: TranslateResult;
	path?: TranslateResult;
	kpri?: TranslateResult;
}

export const INITIAL_FORM_STATE: FormState = {
	protocol: 'ssh',
	host: '',
	port: '22',
	user: '',
	pass: '',
	path: '',
	kpri: '',
};
