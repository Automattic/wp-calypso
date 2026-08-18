import apiFetch from '@wordpress/api-fetch';
import { useCallback, useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { _n, __, sprintf } from '@wordpress/i18n';
import {
	getTrustedUpgradeUrl,
	type JetpackAiChatNotice,
	useChatNotice as useQuotaRejectionNotice,
} from './quota-notice';
import { trackJetpackAiUpgrade } from './utils/tracking';

const FREE_TIER_SLUGS = new Set( [ 'jetpack_ai_free', 'ai-assistant-tier-free' ] );
const LOCAL_STATUS_PATH = '/wpcom/v2/jetpack-ai/ai-assistant-feature';

// Self-hosted status is cached for 60 seconds. Refresh after that response expires.
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
}: FreeCreditNoticeOptions ): JetpackAiChatNotice | undefined {
	const rejectionNotice = useQuotaRejectionNotice( { error: enabled ? error : null } );
	const [ freeCreditState, setFreeCreditState ] = useState< FreeCreditState | undefined >();
	const settledRequestCountRef = useRef( settledRequestCount );
	const requestCachedRefresh = useRef< ( ( count: number ) => void ) | null >( null );
	settledRequestCountRef.current = settledRequestCount;

	const statusKey =
		isPositiveInteger( siteId ) && statusPath ? `${ siteId }:${ statusPath }` : null;

	useEffect( () => {
		if ( ! fetchEnabled || ! statusKey || ! statusPath ) {
			requestCachedRefresh.current = null;
			return;
		}

		let active = true;
		let dirty = false;
		let initialVerificationRequired = true;
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

		const startStatusRequest = ( isInitialRequest: boolean ) => {
			if ( ! active || isRequestInFlight ) {
				return;
			}

			clearRefreshTimer();
			isRequestInFlight = true;
			dirty = false;
			const coveredSettledRequestCount = observedSettledRequestCount;

			void apiFetch< AiAssistantFeatureResponse >( { path: statusPath } )
				.then( ( response ) => {
					if ( ! active ) {
						return;
					}

					const status = getFreeCreditStatus( response );
					if ( status !== undefined ) {
						setFreeCreditState( { key: statusKey, status } );
					}

					completeStatusRequest(
						status !== undefined,
						isInitialRequest,
						coveredSettledRequestCount
					);
				} )
				.catch( () => {
					if ( active ) {
						completeStatusRequest( false, isInitialRequest, coveredSettledRequestCount );
					}
				} );
		};

		const scheduleStatusRequest = () => {
			if ( ! active || isRequestInFlight || refreshTimer !== null ) {
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

		function completeStatusRequest(
			isUsableResponse: boolean,
			isInitialRequest: boolean,
			coveredSettledRequestCount: number
		) {
			isRequestInFlight = false;
			lastCompletedAt = Date.now();
			const hasUncoveredRequest = observedSettledRequestCount !== coveredSettledRequestCount;
			consecutiveFailures = isUsableResponse ? 0 : consecutiveFailures + 1;

			if ( ! isInitialRequest && isUsableResponse ) {
				initialVerificationRequired = false;
			}
			if ( hasUncoveredRequest ) {
				dirty = true;
			}

			const needsCacheVerification =
				isUsableResponse && ( isInitialRequest || initialVerificationRequired );
			const canRetryFailure = ! isUsableResponse && consecutiveFailures < 2;
			if ( dirty || needsCacheVerification || canRetryFailure ) {
				scheduleStatusRequest();
			}
		}

		const handleSettledRequestCount = ( count: number ) => {
			if ( count === observedSettledRequestCount ) {
				return;
			}

			observedSettledRequestCount = count;
			dirty = true;
			consecutiveFailures = 0;
			if ( ! isRequestInFlight ) {
				scheduleStatusRequest();
			}
		};

		requestCachedRefresh.current = handleSettledRequestCount;
		startStatusRequest( true );

		return () => {
			active = false;
			clearRefreshTimer();
			if ( requestCachedRefresh.current === handleSettledRequestCount ) {
				requestCachedRefresh.current = null;
			}
		};
	}, [ fetchEnabled, refreshDelayMs, siteId, statusKey, statusPath ] );

	useEffect( () => {
		requestCachedRefresh.current?.( settledRequestCount );
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

		try {
			trackJetpackAiUpgrade();
		} catch {
			// Analytics must never block checkout navigation.
		}
		window.location.assign( upgradeUrl );
	}, [ upgradeUrl ] );

	return useMemo( () => {
		if ( ! enabled ) {
			return undefined;
		}

		if ( status === null ) {
			return rejectionNotice;
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

		if ( rejectionNotice?.suppressCurrentError ) {
			return rejectionNotice;
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
				action: upgradeUrl
					? { label: __( 'Upgrade', __i18n_text_domain__ ), onClick: onUpgradeClick }
					: undefined,
			};
		}

		return rejectionNotice;
	}, [ enabled, onUpgradeClick, rejectionNotice, status, upgradeUrl ] );
}

export function useJetpackFreeCreditChatNotice( {
	isWpcomPlatform,
	...props
}: FreeCreditNoticeProps ): JetpackAiChatNotice | undefined {
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
