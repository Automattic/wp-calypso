import { isWpError } from '../error';

export function getStaticSiteImportErrorCode( error: unknown ): string | undefined {
	return isWpError( error ) && typeof error.code === 'string' ? error.code : undefined;
}
