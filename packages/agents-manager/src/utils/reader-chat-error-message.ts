import { __ } from '@wordpress/i18n';

type ReaderChatError = {
	code?: unknown;
	message?: unknown;
	response?: {
		status?: unknown;
	};
	status?: unknown;
	statusCode?: unknown;
	data?: {
		code?: unknown;
		message?: unknown;
		status?: unknown;
		statusCode?: unknown;
	};
	error?: {
		code?: unknown;
		message?: unknown;
		status?: unknown;
		statusCode?: unknown;
	};
};

const SEARCH_LIMIT_ERROR_CODES = new Set( [
	'reader_chat_search_ai_over_limit',
	'reader_chat_search_over_limit',
	'instant_search_overage',
	'jetpack_ai_usage',
] );

const UNAVAILABLE_ERROR_CODES = new Set( [
	'reader_chat_invalid_target',
	'reader_chat_search_not_supported',
	'ai_search_inactive',
] );

const RATE_LIMIT_ERROR_MESSAGE = 'Too many requests. Please try again later.';

function readString( value: unknown ): string | undefined {
	return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function readNumber( value: unknown ): number | undefined {
	if ( typeof value === 'number' ) {
		return Number.isFinite( value ) ? value : undefined;
	}

	if ( typeof value !== 'string' || value.trim().length === 0 ) {
		return undefined;
	}

	const numberValue = Number( value );
	return Number.isFinite( numberValue ) ? numberValue : undefined;
}

function getErrorCode( error: unknown ): string | undefined {
	if ( ! error || typeof error !== 'object' ) {
		return undefined;
	}

	const structuredError = error as ReaderChatError;
	return (
		readString( structuredError.code ) ||
		readString( structuredError.data?.code ) ||
		readString( structuredError.error?.code )
	);
}

function getErrorMessage( error: unknown ): string | undefined {
	if ( typeof error === 'string' ) {
		return readString( error );
	}

	if ( ! error || typeof error !== 'object' ) {
		return undefined;
	}

	const structuredError = error as ReaderChatError;
	return (
		readString( structuredError.message ) ||
		readString( structuredError.data?.message ) ||
		readString( structuredError.error?.message )
	);
}

function getErrorCodeFromMessage( message: string | undefined ): string | undefined {
	if ( ! message ) {
		return undefined;
	}

	const codeMatch = message.match( /"code"\s*:\s*"([^"]+)"/ );
	const code = codeMatch?.[ 1 ];
	if ( code && SEARCH_LIMIT_ERROR_CODES.has( code ) ) {
		return code;
	}

	if ( code && UNAVAILABLE_ERROR_CODES.has( code ) ) {
		return code;
	}

	if ( 'request_limit_exceeded' === code ) {
		return code;
	}

	return undefined;
}

function isSearchLimitMessage( message: string | undefined ): boolean {
	if ( ! message ) {
		return false;
	}

	const normalizedMessage = message.toLowerCase();
	return (
		normalizedMessage.includes( 'reached its jetpack search' ) &&
		normalizedMessage.includes( 'usage limit' )
	);
}

function isUnavailableMessage( message: string | undefined ): boolean {
	if ( ! message ) {
		return false;
	}

	const normalizedMessage = message.toLowerCase();
	return normalizedMessage.includes( 'reader chat is not available' );
}

function isRateLimitMessage( message: string | undefined ): boolean {
	if ( ! message ) {
		return false;
	}

	const normalizedMessage = message.toLowerCase();
	return (
		normalizedMessage.includes( RATE_LIMIT_ERROR_MESSAGE.toLowerCase() ) ||
		( /\b429\b/.test( message ) &&
			( normalizedMessage.includes( 'too many requests' ) ||
				normalizedMessage.includes( 'rate limit' ) ) )
	);
}

function getErrorStatus( error: unknown ): number | undefined {
	if ( ! error || typeof error !== 'object' ) {
		return undefined;
	}

	const structuredError = error as ReaderChatError;
	return (
		readNumber( structuredError.status ) ??
		readNumber( structuredError.statusCode ) ??
		readNumber( structuredError.response?.status ) ??
		readNumber( structuredError.data?.status ) ??
		readNumber( structuredError.data?.statusCode ) ??
		readNumber( structuredError.error?.status ) ??
		readNumber( structuredError.error?.statusCode )
	);
}

export function getReaderChatErrorMessage( error: unknown ): string | null {
	if ( ! error ) {
		return null;
	}

	const message = getErrorMessage( error );
	const code = getErrorCode( error ) || getErrorCodeFromMessage( message );
	const hasSearchLimitCode = code && SEARCH_LIMIT_ERROR_CODES.has( code );
	const hasSearchLimitMessage = isSearchLimitMessage( message );
	if ( hasSearchLimitCode || hasSearchLimitMessage ) {
		return __(
			'Reader Chat is temporarily unavailable because this site has reached its Jetpack Search usage limit.',
			__i18n_text_domain__
		);
	}

	const hasUnavailableCode = code && UNAVAILABLE_ERROR_CODES.has( code );
	const hasUnavailableMessage = isUnavailableMessage( message );
	if ( hasUnavailableCode || hasUnavailableMessage ) {
		return __( 'Reader Chat is not available for this site.', __i18n_text_domain__ );
	}

	if (
		'request_limit_exceeded' === code ||
		429 === getErrorStatus( error ) ||
		isRateLimitMessage( message )
	) {
		return __( 'Too many requests. Please try again later.', __i18n_text_domain__ );
	}

	return __( 'Reader Chat is unavailable. Please try again later.', __i18n_text_domain__ );
}
