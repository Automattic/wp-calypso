import { marketplacePluginQuery } from '@automattic/api-queries';
import { WPCOM_FEATURES_ATOMIC } from '@automattic/calypso-products';
import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { useQueryTheme } from 'calypso/components/data/query-theme';
import {
	isRevertedTransferStatus,
	transferStates as atomicTransferStates,
} from 'calypso/landing/stepper/utils/atomic-transfer-outcome';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useWaitHeartbeat } from 'calypso/lib/analytics/wait-heartbeat';
import { useSelector, useDispatch } from 'calypso/state';
import { initiateAtomicTransfer } from 'calypso/state/atomic/transfers/actions';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import { getAutomatedTransferStatus } from 'calypso/state/automated-transfer/selectors';
import { getPurchaseFlowState } from 'calypso/state/marketplace/purchase-flow/selectors';
import { MARKETPLACE_ASYNC_PROCESS_STATUS } from 'calypso/state/marketplace/types';
import { installPlugin, activatePlugin } from 'calypso/state/plugins/installed/actions';
import {
	getPluginOnSite,
	getStatusForPlugin,
	isPluginActive,
} from 'calypso/state/plugins/installed/selectors-ts';
import {
	PLUGIN_INSTALLATION_ERROR,
	PLUGIN_INSTALLATION_IN_PROGRESS,
} from 'calypso/state/plugins/installed/status/constants';
import { fetchPluginData as wporgFetchPluginData } from 'calypso/state/plugins/wporg/actions';
import { getPlugin, isFetched } from 'calypso/state/plugins/wporg/selectors';
import { getCurrentQueryArguments } from 'calypso/state/selectors/get-current-query-arguments';
import getPluginUploadError from 'calypso/state/selectors/get-plugin-upload-error';
import getPluginUploadMethod from 'calypso/state/selectors/get-plugin-upload-method';
import getPluginUploadProgress from 'calypso/state/selectors/get-plugin-upload-progress';
import getUploadedPluginId from 'calypso/state/selectors/get-uploaded-plugin-id';
import isPluginUploadComplete from 'calypso/state/selectors/is-plugin-upload-complete';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import {
	initiateThemeTransfer as initiateTransfer,
	installAndActivateTheme,
} from 'calypso/state/themes/actions';
import { getTheme, isThemeActive as getThemeActive } from 'calypso/state/themes/selectors';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import { chooseInstallStrategy } from './install-strategy';
import { useDelayedCondition } from './use-delayed-condition';
import { INSTALL_DEADLINE_MS, isSettled, useInstallDeadline } from './use-install-deadline';
import useMarketplaceAdditionalSteps from './use-marketplace-additional-steps';
import { useThankYouRedirect } from './use-thank-you-redirect';
import type { AtomicTransfer } from '@automattic/api-core';

// The state authorizing an install is handed off asynchronously, so allow for it arriving late.
const INSTALL_HANDOFF_GRACE_PERIOD_MS = 2000;

// Do not let a slow latest-transfer request block an authorized install indefinitely.
const TRANSFER_LOOKUP_GRACE_PERIOD_MS = 2000;

// The plan's feature list is fetched asynchronously; allow for it arriving late.
const PLAN_FEATURES_GRACE_PERIOD_MS = 2000;

// Attempts older than the maximum install wait are no longer recoverable by this screen.
const ADOPTABLE_TRANSFER_AGE_MS = INSTALL_DEADLINE_MS;
const TRANSFER_ATTEMPT_CLOCK_SKEW_MS = 60 * 1000;
const TRANSFER_ATTEMPT_KEY_PREFIX = 'marketplace-product-install-transfer';

type TransferAttempt = {
	initiatedAt: number;
	previousTransferId: number | null;
	// Whether the transfer lookup had answered by the time this attempt started. Without it, a null
	// `previousTransferId` cannot tell "the site had no transfer" from "we never found out".
	lookupSettled: boolean;
};

const getTransferAttemptKey = ( siteId: number, pluginSlug: string ) =>
	`${ TRANSFER_ATTEMPT_KEY_PREFIX }:${ siteId }:${ pluginSlug }`;

const readTransferAttempt = ( key: string ): TransferAttempt | null => {
	if ( ! key || typeof window === 'undefined' ) {
		return null;
	}

	try {
		const value = JSON.parse( window.sessionStorage.getItem( key ) ?? 'null' );
		if (
			! Number.isFinite( value?.initiatedAt ) ||
			! ( Number.isFinite( value.previousTransferId ) || value.previousTransferId === null )
		) {
			return null;
		}
		// A marker from before this field existed is read as an unresolved lookup, the stricter rule.
		return { ...value, lookupSettled: value.lookupSettled === true };
	} catch {
		return null;
	}
};

const clearTransferAttempt = ( key: string ) => {
	if ( ! key || typeof window === 'undefined' ) {
		return;
	}

	try {
		window.sessionStorage.removeItem( key );
	} catch {
		// Nothing persisted, so there is nothing to recover or clear.
	}
};

const writeTransferAttempt = ( key: string, attempt: TransferAttempt ) => {
	if ( ! key || typeof window === 'undefined' ) {
		return;
	}

	try {
		window.sessionStorage.setItem( key, JSON.stringify( attempt ) );
	} catch {
		// Recovery can still use the current mount's ref when storage is unavailable.
	}
};

const installFlowName = ( {
	themeSlug,
	isPluginUploadFlow,
}: {
	themeSlug: string;
	isPluginUploadFlow: boolean;
} ) => {
	if ( themeSlug ) {
		return 'theme';
	}
	return isPluginUploadFlow ? 'upload' : 'plugin';
};

export type ProductInstallError =
	| { type: 'non-installable-plan' }
	| { type: 'no-direct-access-upload' }
	| { type: 'theme-direct-install' }
	| { type: 'rejected-upload'; reason: 'exists' | 'malicious' | 'too-big' }
	| { type: 'transfer-failed' }
	| { type: 'timeout' }
	| { type: 'generic' };

export function useProductInstall( {
	pluginSlug = '',
	themeSlug = '',
}: {
	pluginSlug?: string;
	themeSlug?: string;
} ) {
	const isPluginUploadFlow = ! pluginSlug && ! themeSlug;
	const [ currentStep, setCurrentStep ] = useState( 0 );
	// A ref, not state, so the guard commits synchronously: the dispatch inside the effect notifies
	// subscribers before a setState would, which would otherwise re-enter and dispatch again.
	const installFlowInitiatedRef = useRef( false );
	const [ atomicFlow, setAtomicFlow ] = useState( false );
	const [ userDirectInstallationAllowed, setUserDirectInstallationAllowed ] = useState( false );
	// The signup flow reaches this page via a full-page redirect that drops the in-memory handoff
	// state. A trusted redirect (directInstall) authorizes the install directly, rather than
	// waiting on handoff state that will never arrive.
	const directInstallFromSignup = useSelector( getCurrentQueryArguments )?.directInstall != null;
	const directInstallationAllowed = userDirectInstallationAllowed || directInstallFromSignup;
	const translate = useTranslate();
	const dispatch = useDispatch();
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const selectedSite = useSelector( getSelectedSite );
	const siteId = useSelector( getSelectedSiteId ) as number;
	const pluginUploadProgress = useSelector( ( state ) => getPluginUploadProgress( state, siteId ) );
	const pluginUploadError = useSelector( ( state ) => getPluginUploadError( state, siteId ) );
	const pluginExists = pluginUploadError?.error === 'folder_exists';
	const pluginMalicious = pluginUploadError?.error === 'plugin_malicious';
	const pluginTooBig = pluginUploadError?.statusCode === 413;
	const wporgPlugin = useSelector( ( state ) => getPlugin( state, pluginSlug ) );
	const isWporgPluginFetched = useSelector( ( state ) => isFetched( state, pluginSlug ) );
	const uploadedPluginSlug = useSelector( ( state ) =>
		getUploadedPluginId( state, siteId )
	) as string;
	const pluginUploadComplete = useSelector( ( state ) => isPluginUploadComplete( state, siteId ) );
	// A zip upload that brought the site to Atomic. Its plugin arrives with the transfer rather than
	// through an install this page dispatched, so the recovery poll is what watches for it — and
	// retries its activation, which the one-shot effect below cannot.
	const uploadMethod = useSelector( ( state ) => getPluginUploadMethod( state, siteId ) );
	const isTransferredUpload = isPluginUploadFlow && uploadMethod === 'transfer';

	// Installed plugins are indexed by the slug they were installed under, which for a marketplace
	// product is its software_slug (e.g. js-composer installs as js_composer), not the route slug.
	// A .org slug 404s here, which is expected — don't retry it — and falls back to the route slug.
	const { data: marketplacePlugin } = useQuery( {
		...marketplacePluginQuery( pluginSlug ),
		enabled: !! pluginSlug,
		retry: ( count, error ) => ( error as { status?: number } )?.status !== 404 && count < 2,
	} );
	const installedPluginSlug = isPluginUploadFlow
		? uploadedPluginSlug
		: marketplacePlugin?.software_slug || marketplacePlugin?.org_slug || pluginSlug;
	const installedPlugin = useSelector( ( state ) =>
		getPluginOnSite( state, siteId, installedPluginSlug )
	);
	const pluginActive = useSelector( ( state ) =>
		isPluginActive( state, siteId, installedPluginSlug )
	);
	const automatedTransferStatus = useSelector( ( state ) =>
		getAutomatedTransferStatus( state, siteId )
	);
	const transferAttemptKey =
		siteId && pluginSlug ? getTransferAttemptKey( siteId, pluginSlug ) : '';
	const transferAttemptRef = useRef< { key: string; attempt: TransferAttempt | null } >( {
		key: '',
		attempt: null,
	} );
	// A transfer outcome outlives the poll that reported it, so it is latched rather than derived.
	// Both belong to the attempt below and are cleared with it — a different product must not
	// inherit the previous one's completion.
	const durableTransferCompletedRef = useRef( false );
	const durableTransferFailedRef = useRef( false );
	if ( transferAttemptRef.current.key !== transferAttemptKey ) {
		transferAttemptRef.current = {
			key: transferAttemptKey,
			attempt: readTransferAttempt( transferAttemptKey ),
		};
		durableTransferCompletedRef.current = false;
		durableTransferFailedRef.current = false;
	}
	const persistedTransferAttempt = transferAttemptRef.current.attempt;
	const transferAttemptAge = persistedTransferAttempt
		? Date.now() - persistedTransferAttempt.initiatedAt
		: NaN;
	const hasCurrentTransferAttempt =
		!! persistedTransferAttempt &&
		transferAttemptAge >= -TRANSFER_ATTEMPT_CLOCK_SKEW_MS &&
		transferAttemptAge <= ADOPTABLE_TRANSFER_AGE_MS;
	const isTransferFromAttempt = useCallback(
		( candidate: AtomicTransfer ) => {
			if ( ! persistedTransferAttempt || ! hasCurrentTransferAttempt ) {
				return false;
			}

			const createdAt = Date.parse( candidate.created_at );
			const age = Date.now() - createdAt;
			// Our own transfer is created after we ask for it, so clock skew is the only thing that can
			// date it before this attempt. The grace for that is safe to give except when the lookup
			// had not answered yet: a null `previousTransferId` then hides a transfer that already
			// existed, and the grace would adopt it as ours.
			const isPriorTransferUnknown =
				persistedTransferAttempt.previousTransferId === null &&
				! persistedTransferAttempt.lookupSettled;
			const minimumCreatedAt = isPriorTransferUnknown
				? persistedTransferAttempt.initiatedAt
				: persistedTransferAttempt.initiatedAt - TRANSFER_ATTEMPT_CLOCK_SKEW_MS;
			return (
				! Number.isNaN( createdAt ) &&
				age >= -TRANSFER_ATTEMPT_CLOCK_SKEW_MS &&
				age <= ADOPTABLE_TRANSFER_AGE_MS &&
				candidate.atomic_transfer_id !== persistedTransferAttempt.previousTransferId &&
				createdAt >= minimumCreatedAt
			);
		},
		[ hasCurrentTransferAttempt, persistedTransferAttempt ]
	);

	// Statuses are keyed by the plugin id the dispatches carry (e.g. 'akismet/akismet'), not by
	// the route slug — and the upload flow has no route slug at all.
	const pluginInstallStatus = useSelector( ( state ) =>
		getStatusForPlugin( state, siteId, installedPlugin?.id ?? wporgPlugin?.id ?? pluginSlug )
	);

	// Only an in-progress → error transition counts: the plugins slice outlives the page, so a
	// record (or `error` field) left by an earlier attempt must not condemn a fresh one. The
	// component survives SPA navigation, so an identity change resets the latch and makes the new
	// product's current status the baseline.
	const [ installFailureSeen, setInstallFailureSeen ] = useState( false );
	const previousInstallStatusRef = useRef< string | undefined >( undefined );
	const installIdentity = `${ siteId }:${ pluginSlug }:${ themeSlug }`;
	const installIdentityRef = useRef( installIdentity );
	const observedInstallStatus = pluginInstallStatus?.status;
	if ( installIdentityRef.current !== installIdentity ) {
		installIdentityRef.current = installIdentity;
		if ( installFailureSeen ) {
			setInstallFailureSeen( false );
		}
	} else if (
		observedInstallStatus === PLUGIN_INSTALLATION_ERROR &&
		previousInstallStatusRef.current === PLUGIN_INSTALLATION_IN_PROGRESS &&
		! installFailureSeen
	) {
		setInstallFailureSeen( true );
	}
	previousInstallStatusRef.current = observedInstallStatus;

	const wpOrgTheme = useSelector( ( state ) => getTheme( state, 'wporg', themeSlug ) );
	const isThemeActive = useSelector( ( state ) => getThemeActive( state, themeSlug, siteId ) );
	useQueryTheme( 'wporg', themeSlug );

	const { pluginInstallationStatus, productSlugInstalled, primaryDomain } =
		useSelector( getPurchaseFlowState );

	const isInstallationPending =
		pluginInstallationStatus !== MARKETPLACE_ASYNC_PROCESS_STATUS.COMPLETED &&
		primaryDomain === selectedSiteSlug;
	const marketplaceInstallationInProgress = isPluginUploadFlow
		? isInstallationPending
		: isInstallationPending &&
		  !! productSlugInstalled &&
		  [ pluginSlug, themeSlug ].includes( productSlugInstalled );

	const isJetpack = useSelector( ( state ) => isJetpackSite( state, selectedSite?.ID ?? null ) );
	const isAtomic = useSelector( ( state ) =>
		isSiteAutomatedTransfer( state, selectedSite?.ID ?? null )
	);
	const hasAtomicFeature = useSelector( ( state ) =>
		siteHasFeature( state, selectedSite?.ID ?? null, WPCOM_FEATURES_ATOMIC )
	);

	// retrieve plugin data if not available
	useEffect( () => {
		if ( ! isWporgPluginFetched ) {
			dispatch( wporgFetchPluginData( pluginSlug ) );
		}
	}, [ isWporgPluginFetched, pluginSlug, dispatch ] );

	// How this site can install the product (in place, via an Atomic transfer, or not at all).
	const installStrategy = chooseInstallStrategy( {
		siteInstallsInPlace: !! ( isJetpack || isAtomic ),
		siteCanTransferToAtomic: !! hasAtomicFeature,
	} );

	// Only conclude the site can't install once no strategy has been available for the grace period.
	// Deriving from the same strategy the install uses keeps the two in agreement, and it clears if
	// eligibility arrives late.
	const nonInstallablePlanError = useDelayedCondition(
		installStrategy === 'none',
		PLAN_FEATURES_GRACE_PERIOD_MS
	);

	const isInstallAuthorizationMissing =
		// 1. This is a plugin upload flow (via zip file) and we don't have a primary domain set
		( isPluginUploadFlow && ! primaryDomain ) ||
		// 2. This is a marketplace plugin installation but the installation process hasn't started
		( ! isPluginUploadFlow && ! marketplaceInstallationInProgress );

	// Flows that carry their own authorization never render this error, so don't arm the timer.
	const noDirectAccessError = useDelayedCondition(
		isInstallAuthorizationMissing && ! directInstallationAllowed,
		INSTALL_HANDOFF_GRACE_PERIOD_MS
	);

	// Errors this page can tell apart before the wait even starts. They are also what says the wait
	// is not really running, so the deadline below stays disarmed while one of them holds.
	const preflightError: ProductInstallError | null = ( () => {
		if ( nonInstallablePlanError ) {
			return { type: 'non-installable-plan' };
		}
		if ( isPluginUploadFlow && noDirectAccessError && ! directInstallationAllowed ) {
			return { type: 'no-direct-access-upload' };
		}
		if ( themeSlug && noDirectAccessError && ! directInstallationAllowed ) {
			return { type: 'theme-direct-install' };
		}
		if ( pluginExists ) {
			return { type: 'rejected-upload', reason: 'exists' };
		}
		if ( pluginMalicious ) {
			return { type: 'rejected-upload', reason: 'malicious' };
		}
		if ( pluginTooBig ) {
			return { type: 'rejected-upload', reason: 'too-big' };
		}
		if (
			pluginUploadError ||
			installFailureSeen ||
			( atomicFlow && automatedTransferStatus === transferStates.FAILURE )
		) {
			return { type: 'generic' };
		}
		return null;
	} )();

	// The upload flow reaches this page the moment the upload starts, not when it finishes, and how
	// long the browser takes to send the file is the customer's bandwidth rather than anything this
	// deadline is calibrated for. Gate on the transmitted bytes alone: `pluginUploadComplete` would
	// also wait out the install or transfer the upload triggers, which is the very wait to bound.
	const isUploadStillSending = isPluginUploadFlow && pluginUploadProgress < 100;

	// The Redux status poller bounds the same wait from the other side, so honour its verdict
	// alongside this screen's own deadline rather than treating it as an unexplained failure.
	const hasTransferTimedOut =
		atomicFlow && automatedTransferStatus === transferStates.CLIENT_TIMEOUT;

	const {
		hasTimedOut,
		hasTransferFailed,
		diagnostics,
		transfer,
		isTransferFresh,
		isTransferLookupComplete,
		isTransferLookupNotFound,
	} = useInstallDeadline( {
		siteId,
		enabled: !! siteId && ! preflightError && ! isUploadStillSending,
		isTransferFromAttempt,
	} );
	const latestTransfer = isTransferFresh ? transfer : undefined;
	const transferBelongsToAttempt = !! latestTransfer && isTransferFromAttempt( latestTransfer );
	const transferInFlight = transferBelongsToAttempt && ! isSettled( latestTransfer.status );
	if ( transferBelongsToAttempt && latestTransfer.status === atomicTransferStates.COMPLETED ) {
		durableTransferCompletedRef.current = true;
	}
	if (
		transferBelongsToAttempt &&
		( latestTransfer.status === atomicTransferStates.ERROR ||
			isRevertedTransferStatus( latestTransfer.status ) )
	) {
		durableTransferFailedRef.current = true;
	}
	const durableTransferCompleted = durableTransferCompletedRef.current;
	const durableTransferFailed = durableTransferFailedRef.current;
	const transferHasFailed = hasTransferFailed || durableTransferFailed;
	const transferTimedOut = ! durableTransferCompleted && ( hasTimedOut || hasTransferTimedOut );
	const transferLookupGraceElapsed = useDelayedCondition(
		installStrategy === 'atomic-transfer' &&
			!! pluginSlug &&
			! hasCurrentTransferAttempt &&
			! isTransferLookupComplete,
		TRANSFER_LOOKUP_GRACE_PERIOD_MS
	);

	// Upload flow startup
	useEffect( () => {
		if ( 100 !== pluginUploadProgress ) {
			return;
		}
		// Let the upload step show briefly before advancing.
		const id = setTimeout( () => setCurrentStep( 1 ), 1000 );
		return () => clearTimeout( id );
	}, [ pluginUploadProgress ] );

	// Installing plugin flow startup
	useEffect( () => {
		if (
			isPluginUploadFlow ||
			installFlowInitiatedRef.current ||
			! ( wporgPlugin || wpOrgTheme )
		) {
			return;
		}

		const shouldRecoverTransfer =
			!! pluginSlug && ( transferInFlight || durableTransferCompleted || durableTransferFailed );

		if ( shouldRecoverTransfer ) {
			installFlowInitiatedRef.current = true;
			setAtomicFlow( true );
			if ( ! durableTransferFailed ) {
				setCurrentStep( durableTransferCompleted ? 2 : 1 );
			}
			return;
		}

		// The site may not be installable yet — e.g. its feature data hasn't loaded. Leave the
		// guard unset so a later update (features arriving) can still start the install.
		if ( installStrategy === 'none' ) {
			return;
		}

		if ( transferHasFailed || transferTimedOut ) {
			return;
		}

		if ( ! ( marketplaceInstallationInProgress || directInstallationAllowed ) ) {
			return;
		}

		// A persisted attempt must be resolved by a successful lookup before any install path starts.
		if (
			pluginSlug &&
			hasCurrentTransferAttempt &&
			! isTransferFresh &&
			! isTransferLookupNotFound
		) {
			return;
		}

		// A latest non-settled transfer means the site is already moving toward Atomic. Its identity
		// cannot be safely attributed after a marker expires, so never start another one on this site.
		if (
			installStrategy === 'atomic-transfer' &&
			pluginSlug &&
			isTransferFresh &&
			!! latestTransfer &&
			! isSettled( latestTransfer.status )
		) {
			return;
		}

		// Without a marker, bound the initial lookup so an outage cannot block a newly authorized flow.
		if (
			installStrategy === 'atomic-transfer' &&
			pluginSlug &&
			! isTransferLookupComplete &&
			! transferLookupGraceElapsed
		) {
			return;
		}

		installFlowInitiatedRef.current = true;

		if ( installStrategy === 'in-place' ) {
			if ( wpOrgTheme ) {
				dispatch( installAndActivateTheme( wpOrgTheme.id, siteId ) );
			} else {
				dispatch( installPlugin( siteId, wporgPlugin, false ) );
			}
		} else if ( wpOrgTheme ) {
			dispatch( initiateAtomicTransfer( siteId, { themeSlug, context: 'theme_install' } ) );
		} else {
			const attempt = {
				initiatedAt: Date.now(),
				previousTransferId: latestTransfer?.atomic_transfer_id ?? null,
				lookupSettled: isTransferFresh || isTransferLookupNotFound,
			};
			transferAttemptRef.current = { key: transferAttemptKey, attempt };
			writeTransferAttempt( transferAttemptKey, attempt );
			setAtomicFlow( true );
			dispatch( initiateTransfer( siteId, null, pluginSlug, '', 'plugin_install' ) );
		}
		setCurrentStep( 1 );
	}, [
		marketplaceInstallationInProgress,
		directInstallationAllowed,
		isPluginUploadFlow,
		siteId,
		wporgPlugin,
		wpOrgTheme,
		pluginSlug,
		themeSlug,
		dispatch,
		installStrategy,
		latestTransfer,
		transferInFlight,
		durableTransferCompleted,
		durableTransferFailed,
		transferHasFailed,
		hasTimedOut,
		hasTransferTimedOut,
		transferTimedOut,
		hasCurrentTransferAttempt,
		isTransferFresh,
		isTransferLookupNotFound,
		isTransferLookupComplete,
		transferLookupGraceElapsed,
		transferAttemptKey,
	] );

	// Validate completion of atomic transfer flow
	useEffect( () => {
		if (
			atomicFlow &&
			currentStep === 1 &&
			( transferStates.COMPLETE === automatedTransferStatus || durableTransferCompleted )
		) {
			setCurrentStep( 2 );
		}
	}, [ atomicFlow, automatedTransferStatus, currentStep, durableTransferCompleted ] );

	// Activate once the plugin is installed and the installing step is reached. currentStep is a
	// dependency so a plugin that appears before that step still activates when the step catches up.
	useEffect( () => {
		if (
			installedPlugin &&
			currentStep === 1 &&
			( ! isPluginUploadFlow || pluginUploadComplete )
		) {
			if ( ! isTransferredUpload ) {
				dispatch(
					activatePlugin( siteId, {
						slug: installedPlugin?.slug,
						id: installedPlugin?.id,
					} )
				);
			}
			setCurrentStep( 2 );
		}
	}, [
		installedPlugin,
		currentStep,
		isPluginUploadFlow,
		isTransferredUpload,
		pluginUploadComplete,
		dispatch,
		siteId,
	] );

	// Which error screen to show, in priority order, or null for none. The presentational mapping
	// lives in ProductInstallErrorView; keeping this as data makes the branching testable.
	let error: ProductInstallError | null = preflightError;
	if ( ! error && transferHasFailed ) {
		error = { type: 'transfer-failed' };
	}
	if ( ! error && transferTimedOut ) {
		error = { type: 'timeout' };
	}

	// The product is on the site and switched on: the wait is over, whatever the redirect below does
	// next. Retiring it here rather than on unmount is what separates a finished install from a
	// closed tab — the plugin flow leaves by full-page navigation, which React never sees.
	//
	// Latched, because an install does not un-succeed. The plugin list refetches while the redirect
	// resolves, and the gap where it reads empty would otherwise close this wait and open a second
	// one that lives for a second.
	const hasSucceededRef = useRef( false );
	hasSucceededRef.current =
		hasSucceededRef.current || ( themeSlug ? isThemeActive : !! installedPlugin && pluginActive );
	const hasSucceeded = hasSucceededRef.current;
	const transferAttemptEnded =
		hasSucceeded || ( !! error && error.type !== 'non-installable-plan' );
	useEffect( () => {
		if ( ! transferAttemptEnded || ! transferAttemptRef.current.attempt ) {
			return;
		}
		transferAttemptRef.current = { key: transferAttemptKey, attempt: null };
		clearTransferAttempt( transferAttemptKey );
	}, [ transferAttemptEnded, transferAttemptKey ] );

	// Whether anyone is still watching. The wait stops being one the moment it resolves, either into
	// an error screen or into a success on its way out.
	useWaitHeartbeat( {
		surface: 'marketplace_install',
		enabled: !! siteId && ! isUploadStillSending && ! error && ! hasSucceeded,
		properties: {
			flow: installFlowName( { themeSlug, isPluginUploadFlow } ),
			product_slug: pluginSlug || themeSlug || null,
			site_id: siteId,
			current_step: currentStep,
			install_strategy: installStrategy,
			is_atomic_flow: atomicFlow,
			outcome: error?.type ?? ( hasSucceeded ? 'succeeded' : null ),
		},
	} );

	// Reported once per outcome, so a re-render behind the error screen does not re-send it. The
	// diagnostics ride along because nothing else records why a wait ended: whether a transfer was
	// even involved, where it stalled, and whether the backend had already called it stuck.
	const reportedOutcomeRef = useRef< string | null >( null );
	const diagnosticsRef = useRef( diagnostics );
	diagnosticsRef.current = diagnostics;
	useEffect( () => {
		let outcome = null;
		if ( transferHasFailed ) {
			outcome = 'transfer_failed';
		} else if ( transferTimedOut ) {
			outcome = 'timeout';
		}
		if ( ! outcome || reportedOutcomeRef.current === outcome ) {
			return;
		}
		reportedOutcomeRef.current = outcome;
		recordTracksEvent( 'calypso_marketplace_install_wait_ended', {
			outcome,
			flow: installFlowName( { themeSlug, isPluginUploadFlow } ),
			product_slug: pluginSlug || themeSlug || null,
			site_id: siteId,
			current_step: currentStep,
			// Which path the site took, so a timeout on an in-place install is distinguishable from
			// one on a transfer — they are different failures with the same screen.
			install_strategy: installStrategy,
			is_atomic_flow: atomicFlow,
			...diagnosticsRef.current,
		} );
	}, [
		hasTimedOut,
		hasTransferTimedOut,
		transferTimedOut,
		transferHasFailed,
		themeSlug,
		installStrategy,
		atomicFlow,
		isPluginUploadFlow,
		pluginSlug,
		siteId,
		currentStep,
	] );

	useThankYouRedirect( {
		siteId,
		selectedSiteSlug,
		currentStep,
		isPluginUploadFlow,
		pluginSlug,
		themeSlug,
		wpOrgTheme,
		isThemeActive,
		installedPlugin,
		pluginActive,
		atomicFlow,
		automatedTransferStatus,
		durableTransferCompleted,
		isTransferredUpload,
		halted: !! error,
	} );

	const steps = useMemo( () => {
		if ( themeSlug ) {
			return [ translate( 'Setting up theme installation' ), translate( 'Activating theme' ) ];
		}

		return [
			isPluginUploadFlow
				? translate( 'Uploading plugin' )
				: translate( 'Setting up plugin installation' ),
			translate( 'Installing plugin' ),
			translate( 'Activating plugin' ),
		];
	}, [ themeSlug, isPluginUploadFlow, translate ] );
	const additionalSteps = useMarketplaceAdditionalSteps();

	return {
		siteId,
		currentStep,
		steps,
		additionalSteps,
		error,
		onActivateTheme: () => setUserDirectInstallationAllowed( true ),
	};
}
