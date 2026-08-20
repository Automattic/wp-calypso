import { speak } from '@wordpress/a11y';
import apiFetch from '@wordpress/api-fetch';
import { useCallback, useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { _n, __, sprintf } from '@wordpress/i18n';
import {
	getTrustedUpgradeUrl,
	openJetpackAiUpgrade,
	type JetpackAiChatNoticeResult,
	useChatNotice as useQuotaRejectionNotice,
} from './quota-notice';

const FREE_TIER_SLUGS = new Set( [ 'jetpack_ai_free', 'ai-assistant-tier-free' ] );
const LOCAL_STATUS_PATH = '/wpcom/v2/jetpack-ai/ai-assistant-feature';

// Older Jetpack versions ignore skip_cache, so keep a delayed read after the 60-second cache expires.
const JETPACK_REFRESH_DELAY_MS = 61_000;

interface AiAssistantFeatureResponse {
	'is-over-limit'?: unknown;
	'requests-count'?: unknown;
	'requests-limit'?: unknown;
	'upgrade-url'?: unknown;
	'current-tier'?: {
		slug?: unknown;
		value?: unknown;
		limit?: unknown;
	};
}

interface FreeCreditStatus {
	remaining: number;
	isExhausted: boolean;
	upgradeUrl: string | null;
}

interface FreeCreditState {
	key: string;
	status: FreeCreditStatus | null;
}

interface FreeCreditNoticeProps {
	error: string | null;
	enabled?: boolean;
	isWpcomPlatform?: boolean;
	settledRequestCount?: number;
	siteId?: number;
}

interface FreeCreditNoticeOptions {
	error: string | null;
	enabled: boolean;
	fetchEnabled: boolean;
	refreshDelayMs: number;
	settledRequestCount: number;
	siteId?: number;
	statusPath?: string;
}

type HostWindow = Window & {
	JetpackScriptData?: { site?: { is_wpcom_platform?: unknown } };
	wpApiSettings?: { root?: unknown };
};

function isNonNegativeInteger( value: unknown ): value is number {
	return typeof value === 'number' && Number.isInteger( value ) && value >= 0;
}

function isPositiveInteger( value: unknown ): value is number {
	return isNonNegativeInteger( value ) && value > 0;
}

function isNoticeEnabled( enabled: unknown ): boolean {
	return enabled === undefined ? true : enabled === true;
}

function getSettledRequestCount( settledRequestCount: unknown ): number {
	return isNonNegativeInteger( settledRequestCount ) ? settledRequestCount : 0;
}

function getIsWpcomPlatform( isWpcomPlatform: unknown ): boolean | undefined {
	if ( typeof isWpcomPlatform === 'boolean' ) {
		return isWpcomPlatform;
	}
	if ( typeof window === 'undefined' ) {
		return undefined;
	}

	const scriptDataValue = ( window as HostWindow ).JetpackScriptData?.site?.is_wpcom_platform;
	return typeof scriptDataValue === 'boolean' ? scriptDataValue : undefined;
}

function getSelfHostedStatusPath( wpcomPlatform: boolean | undefined ): string | undefined {
	if ( wpcomPlatform !== false || typeof window === 'undefined' ) {
		return undefined;
	}

	const root = ( window as HostWindow ).wpApiSettings?.root;
	if ( typeof root !== 'string' ) {
		return undefined;
	}

	try {
		const url = new URL( root, window.location.href );
		if ( url.username !== '' || url.password !== '' ) {
			return undefined;
		}
		return url.origin === window.location.origin ? LOCAL_STATUS_PATH : undefined;
	} catch {
		return undefined;
	}
}

export function getFreeCreditStatus(
	response: AiAssistantFeatureResponse
): FreeCreditStatus | null | undefined {
	const currentTier = response[ 'current-tier' ];
	const hasTierIdentity =
		typeof currentTier?.slug === 'string' || typeof currentTier?.value === 'number';
	if ( ! hasTierIdentity ) {
		return undefined;
	}

	const isFreeTier =
		currentTier?.value === 0 ||
		( typeof currentTier?.slug === 'string' && FREE_TIER_SLUGS.has( currentTier.slug ) );
	if ( ! isFreeTier ) {
		return null;
	}
	if ( ! isNonNegativeInteger( response[ 'requests-count' ] ) ) {
		return undefined;
	}

	const limit = isNonNegativeInteger( response[ 'requests-limit' ] )
		? response[ 'requests-limit' ]
		: currentTier?.limit;
	if ( ! isNonNegativeInteger( limit ) ) {
		return undefined;
	}

	const remaining = Math.max( 0, limit - response[ 'requests-count' ] );
	const rawUpgradeUrl = response[ 'upgrade-url' ];

	return {
		remaining,
		isExhausted: response[ 'is-over-limit' ] === true || remaining === 0,
		upgradeUrl: typeof rawUpgradeUrl === 'string' ? getTrustedUpgradeUrl( rawUpgradeUrl ) : null,
	};
}

function useFreeCreditNotice( {
	error,
	enabled,
	fetchEnabled,
	refreshDelayMs,
	settledRequestCount,
	siteId,
	statusPath,
}: FreeCreditNoticeOptions ): JetpackAiChatNoticeResult | undefined {
	const [ freeCreditState, setFreeCreditState ] = useState< FreeCreditState | undefined >();
	const [ recoveryRevision, setRecoveryRevision ] = useState( 0 );
	const settledRequestCountRef = useRef( settledRequestCount );
	const requestStatusRefresh = useRef< ( ( count: number ) => void ) | null >( null );
	const previousNoticeMessageRef = useRef< string | undefined >( undefined );
	const previousSuppressCurrentErrorRef = useRef( false );
	useEffect( () => {
		settledRequestCountRef.current = settledRequestCount;
	}, [ settledRequestCount ] );

	const statusKey =
		isPositiveInteger( siteId ) && statusPath ? `${ siteId }:${ statusPath }` : null;
	const quotaResult = useQuotaRejectionNotice( {
		error: enabled ? error : null,
		recoveryRevision,
		scopeKey: statusKey,
	} );
	const rejectionNotice = quotaResult && 'message' in quotaResult ? quotaResult : undefined;
	const suppressCurrentError = quotaResult?.suppressCurrentError === true;

	useEffect( () => {
		if ( ! fetchEnabled || ! statusKey || ! statusPath ) {
			requestStatusRefresh.current = null;
			return;
		}

		const activeStatusKey = statusKey;
		const activeStatusPath = statusPath;
		let active = true;
		let cachedFallbackNeeded = false;
		let immediateRefreshPending = false;
		let isRequestInFlight = false;
		let consecutiveFailures = 0;
		let lastCompletedAt: number | null = null;
		let observedSettledRequestCount = settledRequestCountRef.current;
		let refreshTimer: number | null = null;

		const clearRefreshTimer = () => {
			if ( refreshTimer !== null ) {
				window.clearTimeout( refreshTimer );
				refreshTimer = null;
			}
		};

		const scheduleCachedFallback = () => {
			if ( ! active || ! cachedFallbackNeeded || isRequestInFlight || refreshTimer !== null ) {
				return;
			}

			const elapsed = lastCompletedAt === null ? 0 : Date.now() - lastCompletedAt;
			const delay = Math.max( 0, refreshDelayMs - elapsed );
			if ( delay === 0 ) {
				startStatusRequest( false );
				return;
			}

			refreshTimer = window.setTimeout( () => {
				refreshTimer = null;
				startStatusRequest( false );
			}, delay );
		};

		function startStatusRequest( skipCache: boolean, isInitialRequest = false ) {
			if ( ! active || isRequestInFlight ) {
				return;
			}

			isRequestInFlight = true;
			if ( skipCache ) {
				clearRefreshTimer();
				cachedFallbackNeeded = true;
			} else if ( ! isInitialRequest ) {
				cachedFallbackNeeded = false;
			}

			void apiFetch< AiAssistantFeatureResponse >( {
				path: skipCache ? `${ activeStatusPath }?skip_cache=true` : activeStatusPath,
			} )
				.then( ( response ) => {
					if ( ! active ) {
						return;
					}

					const status = getFreeCreditStatus( response );
					if ( status !== undefined ) {
						setFreeCreditState( { key: activeStatusKey, status } );
						const hasRecovered =
							status === null ? response[ 'is-over-limit' ] === false : ! status.isExhausted;
						// Only the cache-expired fallback can prove the rejection latch is stale.
						if ( hasRecovered && ! skipCache && ! isInitialRequest ) {
							setRecoveryRevision( ( revision ) => revision + 1 );
						}
					}

					completeStatusRequest( status !== undefined, skipCache );
				} )
				.catch( () => {
					if ( active ) {
						completeStatusRequest( false, skipCache );
					}
				} );
		}

		function completeStatusRequest( isUsableResponse: boolean, skipCache: boolean ) {
			isRequestInFlight = false;
			lastCompletedAt = Date.now();
			consecutiveFailures = isUsableResponse ? 0 : consecutiveFailures + 1;

			if ( ! skipCache && ! isUsableResponse && consecutiveFailures < 2 ) {
				cachedFallbackNeeded = true;
			}

			if ( immediateRefreshPending ) {
				immediateRefreshPending = false;
				startStatusRequest( true );
				return;
			}

			scheduleCachedFallback();
		}

		const handleSettledRequestCount = ( count: number ) => {
			if ( count === observedSettledRequestCount ) {
				return;
			}

			observedSettledRequestCount = count;
			cachedFallbackNeeded = true;
			consecutiveFailures = 0;
			if ( isRequestInFlight ) {
				immediateRefreshPending = true;
				return;
			}

			startStatusRequest( true );
		};

		requestStatusRefresh.current = handleSettledRequestCount;
		startStatusRequest( false, true );

		return () => {
			active = false;
			clearRefreshTimer();
			if ( requestStatusRefresh.current === handleSettledRequestCount ) {
				requestStatusRefresh.current = null;
			}
		};
	}, [ fetchEnabled, refreshDelayMs, siteId, statusKey, statusPath ] );

	useEffect( () => {
		requestStatusRefresh.current?.( settledRequestCount );
	}, [ settledRequestCount ] );

	const status =
		fetchEnabled && statusKey && freeCreditState?.key === statusKey
			? freeCreditState.status
			: undefined;
	const upgradeUrl = status?.upgradeUrl ?? null;
	const onUpgradeClick = useCallback( () => {
		if ( ! upgradeUrl ) {
			return;
		}

		openJetpackAiUpgrade( upgradeUrl );
	}, [ upgradeUrl ] );

	const notice = useMemo( () => {
		if ( ! enabled ) {
			return undefined;
		}

		if ( status === null ) {
			return quotaResult;
		}

		if ( status && ( status.isExhausted || rejectionNotice ) ) {
			return {
				message: __( 'You’re out of free credits.', __i18n_text_domain__ ),
				status: 'error' as const,
				dismissible: false,
				suppressCurrentError: rejectionNotice?.suppressCurrentError ?? false,
				action: upgradeUrl
					? { label: __( 'Upgrade', __i18n_text_domain__ ), onClick: onUpgradeClick }
					: rejectionNotice?.action,
			};
		}

		if ( status ) {
			return {
				message: sprintf(
					/* translators: %d is the number of free Jetpack AI credits remaining. */
					_n(
						'%d free credit left',
						'%d free credits left',
						status.remaining,
						__i18n_text_domain__
					),
					status.remaining
				),
				dismissible: false,
				...( suppressCurrentError && { suppressCurrentError: true as const } ),
				action: upgradeUrl
					? { label: __( 'Upgrade', __i18n_text_domain__ ), onClick: onUpgradeClick }
					: undefined,
			};
		}

		return quotaResult;
	}, [
		enabled,
		onUpgradeClick,
		quotaResult,
		rejectionNotice,
		status,
		suppressCurrentError,
		upgradeUrl,
	] );
	const noticeMessage = notice?.message;
	const noticeStatus = notice?.status;
	const suppressesCurrentError = notice?.suppressCurrentError === true;

	useEffect( () => {
		const messageChanged = noticeMessage !== previousNoticeMessageRef.current;
		const newQuotaRejection = suppressesCurrentError && ! previousSuppressCurrentErrorRef.current;

		previousNoticeMessageRef.current = noticeMessage;
		previousSuppressCurrentErrorRef.current = suppressesCurrentError;

		if ( noticeMessage && ( messageChanged || newQuotaRejection ) ) {
			speak( noticeMessage, noticeStatus === 'error' ? 'assertive' : 'polite' );
		}
	}, [ noticeMessage, noticeStatus, suppressesCurrentError ] );

	return notice;
}

export function useJetpackFreeCreditChatNotice( {
	isWpcomPlatform,
	...props
}: FreeCreditNoticeProps ): JetpackAiChatNoticeResult | undefined {
	const enabled = isNoticeEnabled( props.enabled );
	const wpcomPlatform = getIsWpcomPlatform( isWpcomPlatform );
	const selfHostedEnabled = enabled && wpcomPlatform === false;
	const statusPath = getSelfHostedStatusPath( wpcomPlatform );

	return useFreeCreditNotice( {
		...props,
		enabled: selfHostedEnabled,
		fetchEnabled: selfHostedEnabled && statusPath !== undefined,
		refreshDelayMs: JETPACK_REFRESH_DELAY_MS,
		settledRequestCount: getSettledRequestCount( props.settledRequestCount ),
		statusPath,
	} );
}
