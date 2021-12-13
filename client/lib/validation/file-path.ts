import { translate } from 'i18n-calypso';
import { ValidationError, validator } from './types';

const filePathRegExp = /^\/$|^(\/[^/]+)+\/?$/;
const filePathBackSlashRegExp = /^\\$|^(\\[^/]+)+\\?$/;
const filePathMultiSlashRegExp = /^\/+$|^(\/+[^/]+)+\/*$/;

const validateFilePath: validator< string > = (
	pathToValidate: string
): null | ValidationError => {
	if ( filePathRegExp.test( pathToValidate ) ) {
		return null;
	}
	if ( filePathBackSlashRegExp.test( pathToValidate ) ) {
		return {
			message: translate( 'Use forward slashes, "/", in path.', { textOnly: true } ),
		};
	}

	if ( filePathMultiSlashRegExp.test( pathToValidate ) ) {
		return {
			message: translate( 'Use only single slashes, "/", in path.', { textOnly: true } ),
		};
	}

	return {
		message: translate( 'Not a valid file path.', { textOnly: true } ),
	};
};

export default validateFilePath;
