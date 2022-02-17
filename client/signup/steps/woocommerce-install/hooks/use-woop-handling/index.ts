import { FEATURE_WOOP } from '@automattic/calypso-products';
import { sprintf, __ } from '@wordpress/i18n';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addQueryArgs } from 'calypso/lib/url';
import { requestLatestAtomicTransfer } from 'calypso/state/atomic/transfers/actions';
import { getLatestAtomicTransfer } from 'calypso/state/atomic/transfers/selectors';
import { requestEligibility } from 'calypso/state/automated-transfer/actions';
import { eligibilityHolds as eligibilityHoldsConstants } from 'calypso/state/automated-transfer/constants';
import {
	getEligibility,
	EligibilityData,
	EligibilityWarning,
} from 'calypso/state/automated-transfer/selectors';
import {
	getCurrentUserEmail,
	isCurrentUserEmailVerified,
} from 'calypso/state/current-user/selectors';
import { requestProductsList } from 'calypso/state/products-list/actions';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import hasActiveSiteFeature from 'calypso/state/selectors/has-active-site-feature';
import hasAvailableSiteFeature from 'calypso/state/selectors/has-available-site-feature';
import isAtomicSiteSelector from 'calypso/state/selectors/is-site-automated-transfer';
import { getSiteDomain } from 'calypso/state/sites/selectors';

const TRANSFERRING_NOT_BLOCKERS = [
	eligibilityHoldsConstants.NO_BUSINESS_PLAN, // Plans are upgraded in the install flow.
	eligibilityHoldsConstants.TRANSFER_ALREADY_EXISTS, // Already Atomic sites are handled in the install flow.
];

type EligibilityHook = {
	warnings: EligibilityWarning[];
	wpcomDomain: string | null;
	stagingDomain: string | null;
	wpcomSubdomainWarning: EligibilityWarning | undefined;
	transferringBlockers: string[];
	isDataReady: boolean;
	isTransferringBlocked: boolean;
	siteUpgrading: {
		required: boolean;
		checkoutUrl: string;
		checkoutText: string;
		productName: string;
		description: string;
	};
	isReadyToStart: boolean;
	isAtomicSite: boolean;
	currentUserEmail: string;
	isEmailVerified: boolean;
};

export default function useEligibility( siteId: number ): EligibilityHook {
	const dispatch = useDispatch();

	// Request eligibility data.
	useEffect( () => {
		if ( ! siteId ) {
			return;
		}

		dispatch( requestEligibility( siteId ) );
		dispatch( requestProductsList() );
		dispatch( requestLatestAtomicTransfer( siteId ) );
	}, [ siteId, dispatch ] );

	// Get eligibility data.
	const { eligibilityHolds, eligibilityWarnings }: EligibilityData = useSelector( ( state ) =>
		getEligibility( state, siteId )
	);

	// Get email verification data.
	const currentUserEmail = useSelector( ( state ) => getCurrentUserEmail( state ) );
	const isEmailVerified = useSelector( ( state ) => isCurrentUserEmailVerified( state ) );

	/*
	 * Inspect transfer to detect blockers.
	 * It's considered blocked when:
	 * - status code value has the 5xx shape.
	 * - is_stuck value is True.
	 */
	const { transfer, error: transferError } = useSelector( ( state ) =>
		getLatestAtomicTransfer( state, siteId )
	);
	const isTransferStuck = transfer?.is_stuck || false;
	const isBlockByTransferStatus = transferError && transferError?.status >= 500;

	/*
	 * Filter warnings:
	 * - wordpress_subdomain: it will be addressed in the wpcom subdomain warning step.
	 */
	const warnings = eligibilityWarnings?.filter( ( { id } ) => id !== 'wordpress_subdomain' ) ?? [];

	// Pick the wpcom subdomain.
	const wpcomDomain = useSelector( ( state ) => getSiteDomain( state, siteId ) );

	// Get staging sudomain based on the wpcom subdomain.
	const stagingDomain = wpcomDomain?.replace( /\b\.wordpress\.com/, '.wpcomstaging.com' ) || null;

	// Check whether the wpcom.com subdomain warning is present.
	const wpcomSubdomainWarning = eligibilityWarnings?.find(
		( { id } ) => id === 'wordpress_subdomain'
	);

	// Filter the Woop transferring blockers.
	const transferringBlockers = eligibilityHolds?.filter(
		( hold ) => ! TRANSFERRING_NOT_BLOCKERS.includes( hold )
	);

	// Add blocked-transfer-hold when something is wrong in the transfer status.
	if (
		! transferringBlockers?.includes( eligibilityHoldsConstants.BLOCKED_ATOMIC_TRANSFER ) &&
		( isBlockByTransferStatus || isTransferStuck )
	) {
		transferringBlockers?.push( eligibilityHoldsConstants.BLOCKED_ATOMIC_TRANSFER );
	}

	const transferringDataIsAvailable =
		typeof transferringBlockers !== 'undefined' &&
		( typeof transfer !== 'undefined' || typeof transferError !== 'undefined' );

	/*
	 * Check whether the site transferring is blocked.
	 * True as default, meaning it's True when requesting data.
	 */
	const isTransferringBlocked = ! transferringDataIsAvailable || transferringBlockers?.length > 0;

	/*
	 * Plan site and `woop` site feature.
	 * If the eligibility holds contains `NO_BUSINESS_PLAN`,
	 * if the site doesn't have the `woop` feature,
	 * and if the site has the `woop` feature upgradaable,
	 * then the site needs to be upgraded.
	 */
	const eligibilityNoProperPlan = eligibilityHolds?.includes(
		eligibilityHoldsConstants.NO_BUSINESS_PLAN
	);

	/*
	 * Check whether the `woop` feature is actve.`
	 * It's defined by wpcom in the store product list.
	 */
	const isWoopFeatureActive = useSelector( ( state ) =>
		hasActiveSiteFeature( state, siteId, FEATURE_WOOP )
	);

	/*
	 * Feature available means although the site doesn't have the feature active,
	 * it's available to be activated via buying a plan.
	 */
	const hasWoopFeatureAvailable = useSelector(
		( state ) => hasAvailableSiteFeature( state, siteId, FEATURE_WOOP ) || []
	);

	// The site requires upgrading when the feature is not active and available.
	const requiresUpgrade = Boolean(
		eligibilityNoProperPlan && ! isWoopFeatureActive && hasWoopFeatureAvailable.length
	);

	/*
	 * We pick the first plan from the available plans list.
	 * The priority is defined by the store products list.
	 */
	const upgradingPlan = useSelector( ( state ) =>
		getProductBySlug( state, hasWoopFeatureAvailable[ 0 ] )
	);

	const productName = upgradingPlan?.product_name ?? '';

	const isAtomicSite = !! useSelector( ( state ) => isAtomicSiteSelector( state, siteId ) );

	/*
	 * the site is Ready to Start when:
	 * - siteId is defined
	 * - data is ready
	 * - does not require an upgrade, based on store `woop` feature
	 */
	let isReadyToStart = !! ( siteId && transferringDataIsAvailable && ! requiresUpgrade );

	// when the site is not Atomic, ...
	if ( isReadyToStart && ! isAtomicSite ) {
		isReadyToStart =
			isReadyToStart &&
			! isTransferringBlocked && // there is no blockers from eligibility (holds).
			! ( eligibilityWarnings && eligibilityWarnings.length ); // there is no warnings from eligibility (warnings).
	}

	const siteUpgrading = {
		required: requiresUpgrade,
		checkoutUrl: addQueryArgs(
			{
				redirect_to: addQueryArgs(
					{ siteSlug: wpcomDomain },
					'/start/woocommerce-install/transfer'
				),
				cancel_to: addQueryArgs( { siteSlug: wpcomDomain }, '/start/woocommerce-install/confirm' ),
			},
			`/checkout/${ wpcomDomain }/${ upgradingPlan?.product_slug ?? '' }`
		),
		productName,
		description: productName
			? sprintf(
					/* translators: %s: The upgrading plan name (ex.: WordPress.com Business) */
					__( 'Upgrade to the %s plan and set up your WooCommerce store.' ),
					productName
			  )
			: __( 'Upgrade to set up your WooCommerce store.' ),
		checkoutText: productName
			? sprintf(
					/* translators: %s: The upgrading plan name (ex.: WordPress.com Business) */
					__( 'Upgrade to %s' ),
					productName
			  )
			: __( 'Upgrade' ),
	};

	return {
		warnings,
		wpcomDomain,
		stagingDomain,
		wpcomSubdomainWarning,
		transferringBlockers: transferringBlockers || [],
		isTransferringBlocked,
		siteUpgrading,
		isDataReady: transferringDataIsAvailable,
		isReadyToStart,
		isAtomicSite,
		currentUserEmail,
		isEmailVerified,
	};
}
