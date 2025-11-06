import debugFactory from 'debug';
import { login } from 'calypso/lib/paths';
import { getReduxStore } from 'calypso/lib/redux-bridge';
import { getLogoutUrl } from 'calypso/lib/user/shared-utils';
import { clearStore } from 'calypso/lib/user/store';
import { getCurrentUser } from 'calypso/state/current-user/selectors';

const debug = debugFactory( 'calypso:wpcom-api-error-monitor' );

/**
 * User data needed for logout URL generation
 */
type LogoutUserData =
	| {
			logout_URL?: string;
			localeSlug?: string;
	  }
	| null
	| undefined;

/**
 * API error details used by the monitor
 */
export interface WpcomApiErrorDetails {
	status: number;
	message?: string;
	error?: string;
	context?: string;
}

/**
 * Error entry tracked by the system
 */
interface ErrorEntry {
	timestamp: number;
	status: number;
	message?: string;
	code?: string;
	context?: string;
}

/**
 * Configuration for the error monitor
 */
export interface WpcomApiErrorMonitorConfig {
	// Time window for tracking errors (in milliseconds)
	timeWindow: number;

	// Maximum errors allowed within the time window
	maxErrors: number;

	// Error status codes to track (others are ignored)
	trackedStatusCodes: number[];
}

// Configuration
const DEFAULT_TRACKED_STATUS_CODES: number[] = [ 401, 403 ];

const DEFAULT_CONFIG: WpcomApiErrorMonitorConfig = {
	// Time window for tracking errors (in milliseconds)
	timeWindow: 60000, // 1 minute

	// Maximum errors allowed within the time window
	maxErrors: 10,

	// Error status codes to track (others are ignored)
	trackedStatusCodes: DEFAULT_TRACKED_STATUS_CODES,
};

export class WPCOMApiErrorMonitor {
	private config: WpcomApiErrorMonitorConfig;
	public errors: ErrorEntry[];

	constructor( config: Partial< WpcomApiErrorMonitorConfig > = {} ) {
		this.config = { ...DEFAULT_CONFIG, ...config };
		this.errors = [];
	}

	private shouldTrackError( error: WpcomApiErrorDetails | null | undefined ): boolean {
		if ( ! error || ! error.status ) {
			return false;
		}

		const ignoredMessages = [
			'Network request failed', // Offline errors
			'Failed to fetch', // Browser fetch errors
		];

		if ( ignoredMessages.some( ( msg ) => error.message?.includes( msg ) ) ) {
			debug( 'Ignoring error with message:', error.message );
			return false;
		}

		const ignoredCodes: readonly string[] = [
			'rest_comment_author_required', // User didn't fill in required fields
			'rest_invalid_param', // User provided invalid input
		];

		const errorCode = error.error;
		if ( errorCode && ignoredCodes.includes( errorCode ) ) {
			debug( 'Ignoring error with code:', errorCode );
			return false;
		}

		return true;
	}

	/**
	 * Track an API error
	 * @param error - The error object from the API response
	 * @returns Whether the error triggered a threshold action
	 */
	trackError( error: WpcomApiErrorDetails ): boolean {
		if ( ! error || ! error.status ) {
			return false;
		}

		// Check if this error should be tracked
		if ( ! this.shouldTrackError( error ) ) {
			debug( 'Skipping error based on shouldTrackError check:', error );
			return false;
		}

		const status = error.status;

		debug( 'Tracking API error:', {
			status,
			message: error.message,
			context: error.context,
		} );

		// Only track configured status codes
		if ( ! this.config.trackedStatusCodes.includes( status ) ) {
			return false;
		}

		// Add error to tracking
		const errorEntry: ErrorEntry = {
			timestamp: Date.now(),
			status,
			message: error.message,
			code: error.error,
			context: error.context,
		};

		this.errors.push( errorEntry );

		// Clean old errors outside the time window
		this.cleanOldErrors();

		// Check thresholds
		if ( this.checkThresholdExceeded() ) {
			this.handleThresholdExceeded( error );
			return true;
		}

		return false;
	}

	/**
	 * Clean errors outside the time window
	 */
	private cleanOldErrors(): void {
		const cutoffTime = Date.now() - this.config.timeWindow;
		const originalLength = this.errors.length;

		this.errors = this.errors.filter( ( error ) => error.timestamp > cutoffTime );

		if ( originalLength !== this.errors.length ) {
			debug( `Cleaned ${ originalLength - this.errors.length } old errors` );
		}
	}

	/**
	 * Check if error threshold exceeded
	 * @returns Whether thresholds were exceeded
	 */
	private checkThresholdExceeded(): boolean {
		// Check time window threshold
		if ( this.errors.length >= this.config.maxErrors ) {
			debug( 'Time window error threshold exceeded:', this.errors.length );
			return true;
		}

		return false;
	}

	/**
	 * Handle threshold exceeded - trigger logout
	 * @param error - The error that triggered the threshold
	 */
	private async handleThresholdExceeded( error: WpcomApiErrorDetails ): Promise< void > {
		debug( 'API error threshold exceeded:', {
			errorCount: this.errors.length,
			lastError: error,
		} );

		await this.performLogout();
	}

	/**
	 * Perform logout action
	 */
	private async performLogout(): Promise< void > {
		debug( 'Performing logout due to API errors' );

		try {
			await clearStore();
		} catch ( err ) {
			debug( 'Error while clearing store during logout:', err );
		}

		// Get user data from Redux store
		let userData: LogoutUserData;
		try {
			const store = getReduxStore() as { getState: () => unknown } | null;
			if ( store && typeof store.getState === 'function' ) {
				const user = getCurrentUser( store.getState() );
				userData = user
					? {
							logout_URL: user.logout_URL,
							localeSlug: user.localeSlug,
					  }
					: null;
			} else {
				userData = undefined;
			}
		} catch ( err ) {
			debug( 'Error obtaining user data for logout URL:', err );
			userData = undefined;
		}

		const logoutUrl = getLogoutUrl( userData, login() );
		if ( logoutUrl ) {
			window.location.href = logoutUrl;
		}
	}
}

// Create singleton instance
let monitorInstance: WPCOMApiErrorMonitor | null = null;

function getWPCOMApiErrorMonitor(
	config?: Partial< WpcomApiErrorMonitorConfig >
): WPCOMApiErrorMonitor {
	if ( ! monitorInstance ) {
		monitorInstance = new WPCOMApiErrorMonitor( config );
	}

	return monitorInstance;
}

const numericStatusFromCandidate = ( candidate: unknown ): number | null => {
	if ( typeof candidate === 'number' && Number.isFinite( candidate ) ) {
		return candidate;
	}

	if ( typeof candidate === 'string' ) {
		const parsed = parseInt( candidate, 10 );
		if ( ! Number.isNaN( parsed ) ) {
			return parsed;
		}
	}

	return null;
};

const isRecord = ( value: unknown ): value is Record< string, unknown > =>
	typeof value === 'object' && value !== null;

type WpcomRequestParams = {
	path?: string;
	apiNamespace?: string;
	url?: string;
	endpoint?: string;
};

/**
 * Capture a WPCOM API failure and trigger logout when thresholds are exceeded.
 * @param params Request parameters describing the failed call
 * @param rawError Error returned from the API layer
 * @returns Whether the error triggered the logout threshold
 */
export function captureErrorForAPIFailureLogoutTrigger(
	params: WpcomRequestParams | null | undefined,
	rawError: unknown
): boolean {
	if ( ! rawError ) {
		return false;
	}

	const errorObject = isRecord( rawError ) ? rawError : {};
	const nestedError = isRecord( errorObject.error ) ? errorObject.error : undefined;

	const statusCandidates = [
		errorObject.status,
		errorObject.statusCode,
		errorObject.code,
		nestedError?.status,
		nestedError?.statusCode,
	];

	let status: number | null = null;
	for ( const candidate of statusCandidates ) {
		status = numericStatusFromCandidate( candidate );
		if ( status !== null ) {
			break;
		}
	}

	if ( status === null ) {
		debug( 'Skipping error without a numeric status code', rawError );
		return false;
	}

	const message = typeof errorObject.message === 'string' ? errorObject.message : undefined;
	let code: string | undefined;
	if ( typeof errorObject.error === 'string' ) {
		code = errorObject.error;
	} else if ( typeof errorObject.code === 'string' ) {
		code = errorObject.code;
	}

	const context =
		params?.path || params?.apiNamespace || params?.url || params?.endpoint || undefined;

	return getWPCOMApiErrorMonitor().trackError( {
		status,
		message,
		error: code,
		context,
	} );
}

// Export the class for testing
