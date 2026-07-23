import { WPCOM_FEATURES_ATOMIC } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState, useMemo, useRef } from 'react';
import { useQueryTheme } from 'calypso/components/data/query-theme';
import { waitFor } from 'calypso/my-sites/marketplace/util';
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
import { fetchPluginData as wporgFetchPluginData } from 'calypso/state/plugins/wporg/actions';
import { getPlugin, isFetched } from 'calypso/state/plugins/wporg/selectors';
import { getCurrentQueryArguments } from 'calypso/state/selectors/get-current-query-arguments';
import getPluginUploadError from 'calypso/state/selectors/get-plugin-upload-error';
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
import useMarketplaceAdditionalSteps from './use-marketplace-additional-steps';
import { useThankYouRedirect } from './use-thank-you-redirect';

// The state authorizing an install is handed off asynchronously, so allow for it arriving late.
const INSTALL_HANDOFF_GRACE_PERIOD_MS = 2000;

// The plan's feature list is fetched asynchronously; allow for it arriving late.
const PLAN_FEATURES_GRACE_PERIOD_MS = 2000;

export type ProductInstallError =
	| { type: 'non-installable-plan' }
	| { type: 'no-direct-access-upload' }
	| { type: 'theme-direct-install' }
	| { type: 'rejected-upload'; reason: 'exists' | 'malicious' | 'too-big' }
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
	const installedPlugin = useSelector( ( state ) =>
		getPluginOnSite( state, siteId, isPluginUploadFlow ? uploadedPluginSlug : pluginSlug )
	);
	const pluginActive = useSelector( ( state ) =>
		isPluginActive( state, siteId, isPluginUploadFlow ? uploadedPluginSlug : pluginSlug )
	);
	const automatedTransferStatus = useSelector( ( state ) =>
		getAutomatedTransferStatus( state, siteId )
	);

	const pluginInstallStatus = useSelector( ( state ) =>
		getStatusForPlugin( state, siteId, pluginSlug )
	);

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
			! ( marketplaceInstallationInProgress || directInstallationAllowed ) ||
			isPluginUploadFlow ||
			installFlowInitiatedRef.current ||
			! ( wporgPlugin || wpOrgTheme )
		) {
			return;
		}

		// The site may not be installable yet — e.g. its feature data hasn't loaded. Leave the
		// guard unset so a later update (features arriving) can still start the install.
		if ( installStrategy === 'none' ) {
			return;
		}

		installFlowInitiatedRef.current = true;
		// Intentionally uncancelable: the ref blocks re-entry, so tying this to the effect's
		// lifetime would let a dependency change drop the step advance rather than reschedule it.
		const triggerInstallFlow = () => {
			waitFor( 1 ).then( () => setCurrentStep( 1 ) );
		};

		if ( installStrategy === 'in-place' ) {
			if ( wpOrgTheme ) {
				dispatch( installAndActivateTheme( wpOrgTheme.id, siteId ) );
			} else {
				dispatch( installPlugin( siteId, wporgPlugin, false ) );
			}
		} else if ( wpOrgTheme ) {
			dispatch( initiateAtomicTransfer( siteId, { themeSlug, context: 'theme_install' } ) );
		} else {
			setAtomicFlow( true );
			dispatch( initiateTransfer( siteId, null, pluginSlug, '', 'plugin_install' ) );
		}
		triggerInstallFlow();
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
	] );

	// Validate completion of atomic transfer flow
	useEffect( () => {
		if ( atomicFlow && currentStep === 1 && transferStates.COMPLETE === automatedTransferStatus ) {
			setCurrentStep( 2 );
		}
	}, [ atomicFlow, automatedTransferStatus, currentStep ] );

	// Activate once the plugin is installed and the installing step is reached. currentStep is a
	// dependency so a plugin that appears before that step still activates when the step catches up.
	useEffect( () => {
		if (
			installedPlugin &&
			currentStep === 1 &&
			( ! isPluginUploadFlow || pluginUploadComplete )
		) {
			dispatch(
				activatePlugin( siteId, {
					slug: installedPlugin?.slug,
					id: installedPlugin?.id,
				} )
			);
			setCurrentStep( 2 );
		}
	}, [ installedPlugin, currentStep, isPluginUploadFlow, pluginUploadComplete, dispatch, siteId ] );

	useThankYouRedirect( {
		siteId,
		selectedSite,
		selectedSiteSlug,
		currentStep,
		isPluginUploadFlow,
		pluginSlug,
		themeSlug,
		wporgPlugin,
		wpOrgTheme,
		isThemeActive,
		installedPlugin,
		pluginActive,
		uploadedPluginSlug,
		atomicFlow,
		isAtomic,
		automatedTransferStatus,
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

	// Which error screen to show, in priority order, or null for none. The presentational mapping
	// lives in ProductInstallErrorView; keeping this as data makes the branching testable.
	const error: ProductInstallError | null = ( () => {
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
			pluginInstallStatus?.error ||
			( atomicFlow && automatedTransferStatus === transferStates.FAILURE )
		) {
			return { type: 'generic' };
		}
		return null;
	} )();

	return {
		siteId,
		currentStep,
		steps,
		additionalSteps,
		error,
		onActivateTheme: () => setUserDirectInstallationAllowed( true ),
	};
}
