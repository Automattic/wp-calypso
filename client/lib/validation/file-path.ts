import { translate } from 'i18n-calypso';
import { ValidationError, validator } from './types';

const filePathRegExp = /^\/$|^(\/[\w-]+)+\/?$/;
const filePathBackSlashRegExp = /^\\$|^(\\[\w-]+)+\\?$/;
const filePathMultiSlashRegExp = /^\/+$|^(\/+[\w-]+)+\/*$/;
const validFilePathChars = /[\w\-/]/g;

const validateFilePath: validator< string > = (
	pathToValidate: string
): null | ValidationError => {
	if ( filePathRegExp.test( pathToValidate ) ) {
		return null;
	}
	if ( filePathBackSlashRegExp.test( pathToValidate ) ) {
		return {
			message: translate( 'Use forward slashes, "/", in path.' ).toString(),
		};
	}
	const invalidCharacters = pathToValidate
		.replace( validFilePathChars, '' )
		.split( '' )
		.filter( ( character, index, array ) => array.indexOf( character ) === index )
		.join( '' );
	if ( invalidCharacters.length > 0 ) {
		return {
			message: translate(
				'Path contains invalid character "%s".',
				'Path contains invalid characters "%s".',
				{
					args: [ invalidCharacters ],
					count: invalidCharacters.length,
				}
			).toString(),
		};
	}

	if ( filePathMultiSlashRegExp.test( pathToValidate ) ) {
		return {
			message: translate( 'Use only single slashes, "/", in path.' ).toString(),
		};
	}

	return {
		message: translate( 'Not a valid file path.' ).toString(),
	};
};

export default validateFilePath;
