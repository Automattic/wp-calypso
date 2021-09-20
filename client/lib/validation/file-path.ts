import { translate } from 'i18n-calypso';
import { ValidationError, validator } from './types';

const filePathRegExp = /^(\/[\w-]+)+\/?$/;
const filePathBackSlashRegExp = /^(\\[\w-]+)+\\?$/;
const validFilePathChars = /[\w\-/]/g;

const validateFilePath: validator< string > = (
	pathToValidate: string
): null | ValidationError => {
	if ( filePathRegExp.test( pathToValidate ) ) {
		return null;
	}
	if ( filePathBackSlashRegExp.test( pathToValidate ) ) {
		return {
			message: translate( 'Use Forward Slashes, "/", in path.' ),
		};
	}
	const invalidCharacters = pathToValidate.replace( validFilePathChars, '' );
	if ( invalidCharacters.length > 0 ) {
		return {
			message: translate( 'Path contains invalid character "%s".', {
				args: [ invalidCharacters ],
			} ).toString(),
		};
	}
	// TODO: possible
	return {
		message: translate( 'Not a valid file path.' ).toString(),
	};
};

export default validateFilePath;
