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

interface AiCreditSnapshotPayload {
	credits_limit?: unknown;
	credits_used?: unknown;
	credits_remaining?: unknown;
	blocked?: unknown;
	exhausted?: unknown;
	resets_at?: unknown;
	upgrade_url?: unknown;
}

interface AiCreditAllowanceStatus {
	kind: 'cost';
	limit: number;
	used: number;
	remaining: number;
	resetsAt: string;
	isExhausted: boolean;
	upgradeUrl: string | null;
}

interface LegacyRequestStatus {
	kind: 'legacy';
	requestsRemaining: number;
	isExhausted: boolean;
	upgradeUrl: string | null;
}

type JetpackAiStatus = AiCreditAllowanceStatus | LegacyRequestStatus;

interface CreditNoticeState {
	key: string;
	status: LegacyRequestStatus | null;
	upgradeUrl: string | null;
}

interface TaskSnapshotIdentity {
	revision: number;
	scopeKey: string;
}

interface UpgradeReturnRefresh {
	taskSnapshot?: TaskSnapshotIdentity;
}

interface JetpackAiCreditNoticeProps {
	error: string | null;
	enabled?: boolean;
	isWpcomPlatform?: boolean;
	aiCredits?: unknown;
	aiCreditsRevision?: number;
	settledRequestCount?: number;
	siteId?: number;
}

interface JetpackAiCreditNoticeOptions {
	error: string | null;
	enabled: boolean;
	fetchEnabled: boolean;
	refreshDelayMs: number;
	aiCredits?: unknown;
	aiCreditsRevision?: number;
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

function getUtcMonthBoundary( value: unknown ): Date | null {
	if ( typeof value !== 'string' ) {
		return null;
	}
	const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.0+)?(?:Z|\+00:00)$/.exec(
		value
	);
	if ( ! match ) {
		return null;
	}

	const date = new Date( value );
	if (
		Number.isNaN( date.getTime() ) ||
		date.getUTCFullYear() !== Number( match[ 1 ] ) ||
		date.getUTCMonth() + 1 !== Number( match[ 2 ] ) ||
		date.getUTCDate() !== Number( match[ 3 ] ) ||
		date.getUTCHours() !== Number( match[ 4 ] ) ||
		date.getUTCMinutes() !== Number( match[ 5 ] ) ||
		date.getUTCSeconds() !== Number( match[ 6 ] ) ||
		date.getUTCDate() !== 1 ||
		date.getUTCHours() !== 0 ||
		date.getUTCMinutes() !== 0 ||
		date.getUTCSeconds() !== 0 ||
		date.getUTCMilliseconds() !== 0
	) {
		return null;
	}

	return date;
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

function getTrustedResponseUpgradeUrl( response: AiAssistantFeatureResponse ): string | null {
	const rawUpgradeUrl = response[ 'upgrade-url' ];
	return typeof rawUpgradeUrl === 'string' ? getTrustedUpgradeUrl( rawUpgradeUrl ) : null;
}

function getAiCreditAllowanceStatus( aiCredits: unknown ): AiCreditAllowanceStatus | undefined {
	if ( ! aiCredits || typeof aiCredits !== 'object' || Array.isArray( aiCredits ) ) {
		return undefined;
	}

	const snapshot = aiCredits as AiCreditSnapshotPayload;
	const limit = snapshot.credits_limit;
	const used = snapshot.credits_used;
	const remaining = snapshot.credits_remaining;
	const resetsAt = snapshot.resets_at;
	const blocked = snapshot.blocked;
	const hasExhaustionState = Object.prototype.hasOwnProperty.call( snapshot, 'exhausted' );
	const isExhausted = hasExhaustionState ? snapshot.exhausted : blocked;

	if (
		! isPositiveInteger( limit ) ||
		! isNonNegativeInteger( used ) ||
		! isNonNegativeInteger( remaining ) ||
		remaining !== Math.max( 0, limit - used ) ||
		typeof blocked !== 'boolean' ||
		typeof isExhausted !== 'boolean' ||
		isExhausted !== ( remaining === 0 ) ||
		( blocked && ! isExhausted ) ||
		! getUtcMonthBoundary( resetsAt ) ||
		typeof resetsAt !== 'string'
	) {
		return undefined;
	}

	return {
		kind: 'cost',
		limit,
		used,
		remaining,
		resetsAt,
		isExhausted,
		upgradeUrl:
			typeof snapshot.upgrade_url === 'string'
				? getTrustedUpgradeUrl( snapshot.upgrade_url )
				: null,
	};
}

function getLegacyRequestStatus(
	response: AiAssistantFeatureResponse
): LegacyRequestStatus | null | undefined {
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

	const requestsRemaining = Math.max( 0, limit - response[ 'requests-count' ] );

	return {
		kind: 'legacy',
		requestsRemaining,
		isExhausted: response[ 'is-over-limit' ] === true || requestsRemaining === 0,
		upgradeUrl: getTrustedResponseUpgradeUrl( response ),
	};
}

export function getJetpackAiStatus(
	response: AiAssistantFeatureResponse,
	aiCredits?: unknown
): JetpackAiStatus | null | undefined {
	return getAiCreditAllowanceStatus( aiCredits ) ?? getLegacyRequestStatus( response );
}

export function formatRemainingPercentage( remaining: number, limit: number ): string {
	const percentage = Math.max( 0, Math.min( 100, Math.floor( ( 100 * remaining ) / limit ) ) );
	return remaining > 0 && percentage === 0 ? '<1%' : `${ percentage }%`;
}

function formatResetDate( resetsAt: string ): string {
	return new Intl.DateTimeFormat( undefined, {
		day: 'numeric',
		month: 'long',
		timeZone: 'UTC',
		year: 'numeric',
	} ).format( new Date( resetsAt ) );
}

function useJetpackAiCreditNotice( {
	aiCredits,
	aiCreditsRevision,
	error,
	enabled,
	fetchEnabled,
	refreshDelayMs,
	settledRequestCount,
	siteId,
	statusPath,
}: JetpackAiCreditNoticeOptions ): JetpackAiChatNoticeResult | undefined {
	const [ creditNoticeState, setCreditNoticeState ] = useState< CreditNoticeState | undefined >();
	const [ recoveryRevision, setRecoveryRevision ] = useState( 0 );
	const [ retiredTaskSnapshot, setRetiredTaskSnapshot ] = useState<
		TaskSnapshotIdentity | undefined
	>();
	const settledRequestCountRef = useRef( settledRequestCount );
	const refreshAfterUpgradeRef = useRef< UpgradeReturnRefresh | null >( null );
	const requestStatusRefresh = useRef<
		( ( count: number, force?: boolean, upgradeReturn?: UpgradeReturnRefresh ) => void ) | null
	>( null );
	useEffect( () => {
		settledRequestCountRef.current = settledRequestCount;
	}, [ settledRequestCount ] );

	const scopeKey = isPositiveInteger( siteId ) ? String( siteId ) : null;
	const statusKey = scopeKey && statusPath ? `${ scopeKey }:${ statusPath }` : null;
	const validAiCreditsRevision = isPositiveInteger( aiCreditsRevision )
		? aiCreditsRevision
		: undefined;
	const parsedTaskStatus = useMemo( () => getAiCreditAllowanceStatus( aiCredits ), [ aiCredits ] );
	const isTaskSnapshotRetired =
		validAiCreditsRevision !== undefined &&
		retiredTaskSnapshot?.scopeKey === scopeKey &&
		retiredTaskSnapshot.revision === validAiCreditsRevision;
	const taskStatus = isTaskSnapshotRetired ? undefined : parsedTaskStatus;
	const taskSnapshotIdentity = useMemo(
		() =>
			taskStatus && scopeKey && validAiCreditsRevision !== undefined
				? { revision: validAiCreditsRevision, scopeKey }
				: undefined,
		[ scopeKey, taskStatus, validAiCreditsRevision ]
	);
	const taskStatusRecoveryKey =
		taskStatus && ! taskStatus.isExhausted && taskSnapshotIdentity
			? `${ taskSnapshotIdentity.scopeKey }:${ taskSnapshotIdentity.revision }`
			: null;
	const quotaResult = useQuotaRejectionNotice( {
		error: enabled ? error : null,
		recoveryRevision,
		scopeKey,
	} );
	const rejectionNotice = quotaResult && 'message' in quotaResult ? quotaResult : undefined;
	const suppressCurrentError = quotaResult?.suppressCurrentError === true;

	useEffect( () => {
		if ( taskStatusRecoveryKey ) {
			setRecoveryRevision( ( revision ) => revision + 1 );
		}
	}, [ taskStatusRecoveryKey ] );

	useEffect( () => {
		if ( ! fetchEnabled || ! statusKey || ! statusPath ) {
			requestStatusRefresh.current = null;
			return;
		}

		const activeStatusKey = statusKey;
		const activeStatusPath = statusPath;
		let active = true;
		let cachedFallbackNeeded = false;
		let fallbackUpgradeReturn: UpgradeReturnRefresh | undefined;
		let immediateRefreshPending = false;
		let queuedUpgradeReturn: UpgradeReturnRefresh | undefined;
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
				startStatusRequest( false, false, fallbackUpgradeReturn );
				return;
			}

			refreshTimer = window.setTimeout( () => {
				refreshTimer = null;
				startStatusRequest( false, false, fallbackUpgradeReturn );
			}, delay );
		};

		function startStatusRequest(
			skipCache: boolean,
			isInitialRequest = false,
			upgradeReturn?: UpgradeReturnRefresh
		) {
			if ( ! active || isRequestInFlight ) {
				return;
			}

			isRequestInFlight = true;
			if ( skipCache ) {
				clearRefreshTimer();
				cachedFallbackNeeded = true;
				if ( upgradeReturn ) {
					fallbackUpgradeReturn = upgradeReturn;
				}
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

					const status = getLegacyRequestStatus( response );
					if ( status !== undefined ) {
						setCreditNoticeState( {
							key: activeStatusKey,
							status,
							upgradeUrl: getTrustedResponseUpgradeUrl( response ),
						} );
						const hasRecovered =
							status === null ? response[ 'is-over-limit' ] === false : ! status.isExhausted;
						const confirmsPaidUpgrade =
							upgradeReturn !== undefined &&
							status === null &&
							response[ 'is-over-limit' ] === false;
						if ( confirmsPaidUpgrade ) {
							if ( upgradeReturn.taskSnapshot ) {
								setRetiredTaskSnapshot( upgradeReturn.taskSnapshot );
							}
							fallbackUpgradeReturn = undefined;
							setRecoveryRevision( ( revision ) => revision + 1 );
						} else if ( hasRecovered && ! skipCache && ! isInitialRequest ) {
							setRecoveryRevision( ( revision ) => revision + 1 );
						}
					}

					completeStatusRequest( status !== undefined, skipCache, upgradeReturn );
				} )
				.catch( () => {
					if ( active ) {
						completeStatusRequest( false, skipCache, upgradeReturn );
					}
				} );
		}

		function completeStatusRequest(
			isUsableResponse: boolean,
			skipCache: boolean,
			upgradeReturn?: UpgradeReturnRefresh
		) {
			isRequestInFlight = false;
			lastCompletedAt = Date.now();
			consecutiveFailures = isUsableResponse ? 0 : consecutiveFailures + 1;
			if ( ! skipCache && upgradeReturn === fallbackUpgradeReturn ) {
				fallbackUpgradeReturn = undefined;
			}

			if ( ! skipCache && ! isUsableResponse && consecutiveFailures < 2 ) {
				cachedFallbackNeeded = true;
			}

			if ( immediateRefreshPending ) {
				immediateRefreshPending = false;
				const upgradeReturn = queuedUpgradeReturn;
				queuedUpgradeReturn = undefined;
				startStatusRequest( true, false, upgradeReturn );
				return;
			}

			scheduleCachedFallback();
		}

		const handleStatusRefresh = (
			count: number,
			force = false,
			upgradeReturn?: UpgradeReturnRefresh
		) => {
			if ( ! force && count === observedSettledRequestCount ) {
				return;
			}

			observedSettledRequestCount = count;
			cachedFallbackNeeded = true;
			consecutiveFailures = 0;
			if ( upgradeReturn ) {
				queuedUpgradeReturn = upgradeReturn;
			}
			if ( isRequestInFlight ) {
				immediateRefreshPending = true;
				return;
			}

			queuedUpgradeReturn = undefined;
			startStatusRequest( true, false, upgradeReturn );
		};
		const handleUpgradeReturn = () => {
			if ( ! refreshAfterUpgradeRef.current || document.visibilityState === 'hidden' ) {
				return;
			}

			const upgradeReturn = refreshAfterUpgradeRef.current;
			refreshAfterUpgradeRef.current = null;
			handleStatusRefresh( settledRequestCountRef.current, true, upgradeReturn );
		};

		requestStatusRefresh.current = handleStatusRefresh;
		window.addEventListener( 'focus', handleUpgradeReturn );
		document.addEventListener( 'visibilitychange', handleUpgradeReturn );
		startStatusRequest( false, true );

		return () => {
			active = false;
			clearRefreshTimer();
			refreshAfterUpgradeRef.current = null;
			window.removeEventListener( 'focus', handleUpgradeReturn );
			document.removeEventListener( 'visibilitychange', handleUpgradeReturn );
			if ( requestStatusRefresh.current === handleStatusRefresh ) {
				requestStatusRefresh.current = null;
			}
		};
	}, [ fetchEnabled, refreshDelayMs, siteId, statusKey, statusPath ] );

	useEffect( () => {
		requestStatusRefresh.current?.( settledRequestCount );
	}, [ settledRequestCount ] );

	const fetchedStatus =
		fetchEnabled && statusKey && creditNoticeState?.key === statusKey
			? creditNoticeState.status
			: undefined;
	const fetchedUpgradeUrl =
		fetchEnabled && statusKey && creditNoticeState?.key === statusKey
			? creditNoticeState.upgradeUrl
			: null;
	const status = useMemo(
		() =>
			taskStatus
				? { ...taskStatus, upgradeUrl: taskStatus.upgradeUrl ?? fetchedUpgradeUrl }
				: fetchedStatus,
		[ fetchedStatus, fetchedUpgradeUrl, taskStatus ]
	);
	const upgradeUrl = status?.upgradeUrl ?? fetchedUpgradeUrl;
	const onUpgradeClick = useCallback( () => {
		if ( ! upgradeUrl ) {
			return;
		}

		openJetpackAiUpgrade( upgradeUrl );
		refreshAfterUpgradeRef.current = { taskSnapshot: taskSnapshotIdentity };
	}, [ taskSnapshotIdentity, upgradeUrl ] );
	const onRejectionUpgradeClick = useCallback( () => {
		if ( ! rejectionNotice?.action ) {
			return;
		}

		rejectionNotice.action.onClick();
		refreshAfterUpgradeRef.current = { taskSnapshot: taskSnapshotIdentity };
	}, [ rejectionNotice, taskSnapshotIdentity ] );

	return useMemo( () => {
		if ( ! enabled ) {
			return undefined;
		}
		const statusUpgradeAction = upgradeUrl
			? { label: __( 'Upgrade', __i18n_text_domain__ ), onClick: onUpgradeClick }
			: undefined;
		const rejectionUpgradeAction = rejectionNotice?.action
			? { ...rejectionNotice.action, onClick: onRejectionUpgradeClick }
			: undefined;
		const exhaustedUpgradeAction = statusUpgradeAction ?? rejectionUpgradeAction;
		const quotaResultWithRefresh =
			rejectionNotice?.action && rejectionUpgradeAction
				? { ...rejectionNotice, action: rejectionUpgradeAction }
				: quotaResult;

		if ( status === null ) {
			return quotaResultWithRefresh;
		}

		if ( status?.kind === 'cost' ) {
			const resetDate = formatResetDate( status.resetsAt );
			if ( status.isExhausted ) {
				return {
					message: sprintf(
						/* translators: 1: exhausted allowance percentage, 2: UTC allowance reset date. */
						__(
							'You’ve used this month’s Jetpack AI allowance (%1$s left). It resets on %2$s (UTC).',
							__i18n_text_domain__
						),
						formatRemainingPercentage( status.remaining, status.limit ),
						resetDate
					),
					status: 'error' as const,
					dismissible: false,
					suppressCurrentError,
					action: exhaustedUpgradeAction,
				};
			}
			if ( rejectionNotice ) {
				return quotaResultWithRefresh;
			}

			return {
				message: sprintf(
					/* translators: 1: remaining percentage, 2: UTC allowance reset date. */
					__(
						'%1$s of this month’s Jetpack AI allowance left. Resets on %2$s (UTC).',
						__i18n_text_domain__
					),
					formatRemainingPercentage( status.remaining, status.limit ),
					resetDate
				),
				dismissible: false,
				...( suppressCurrentError && { suppressCurrentError: true as const } ),
				action: statusUpgradeAction,
			};
		}

		if ( status && ( status.isExhausted || rejectionNotice ) ) {
			return {
				message: __( 'You’re out of free requests.', __i18n_text_domain__ ),
				status: 'error' as const,
				dismissible: false,
				suppressCurrentError,
				action: exhaustedUpgradeAction,
			};
		}

		if ( status ) {
			return {
				message: sprintf(
					/* translators: %d is the number of free Jetpack AI requests remaining. */
					_n(
						'%d free request left',
						'%d free requests left',
						status.requestsRemaining,
						__i18n_text_domain__
					),
					status.requestsRemaining
				),
				dismissible: false,
				...( suppressCurrentError && { suppressCurrentError: true as const } ),
				action: statusUpgradeAction,
			};
		}

		return quotaResultWithRefresh;
	}, [
		enabled,
		onUpgradeClick,
		onRejectionUpgradeClick,
		quotaResult,
		rejectionNotice,
		status,
		suppressCurrentError,
		upgradeUrl,
	] );
}

export function useJetpackFreeCreditChatNotice( {
	isWpcomPlatform,
	...props
}: JetpackAiCreditNoticeProps ): JetpackAiChatNoticeResult | undefined {
	const enabled = isNoticeEnabled( props.enabled );
	const wpcomPlatform = getIsWpcomPlatform( isWpcomPlatform );
	const selfHostedEnabled = enabled && wpcomPlatform === false;
	const statusPath = getSelfHostedStatusPath( wpcomPlatform );

	return useJetpackAiCreditNotice( {
		...props,
		enabled: selfHostedEnabled,
		fetchEnabled: selfHostedEnabled && statusPath !== undefined,
		refreshDelayMs: JETPACK_REFRESH_DELAY_MS,
		settledRequestCount: getSettledRequestCount( props.settledRequestCount ),
		statusPath,
	} );
}
