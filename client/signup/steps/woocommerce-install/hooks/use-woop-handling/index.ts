import { FEATURE_WOOP } from '@automattic/calypso-products';
import { sprintf, __ } from '@wordpress/i18n';
import { useEffect } from 'react';
import { addQueryArgs } from 'calypso/lib/url';
import { useDispatch, useSelector } from 'calypso/state';
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
import getPlansForFeature from 'calypso/state/selectors/get-plans-for-feature';
import isAtomicSiteSelector from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
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
	const currentUserEmail = useSelector( getCurrentUserEmail );
	const isEmailVerified = useSelector( isCurrentUserEmailVerified );

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
	 * Check whether the `woop` feature is actve.`
	 * It's defined by wpcom in the store product list.
	 */
	const hasWoopFeature = useSelector( ( state ) => siteHasFeature( state, siteId, FEATURE_WOOP ) );

	/*
	 * We pick the first plan from the available plans list.
	 * The priority is defined by the store products list.
	 */
	const upgradingPlan = useSelector( ( state ) => {
		const plans = getPlansForFeature( state, siteId, FEATURE_WOOP ) || [];

		return getProductBySlug( state, plans[ 0 ] );
	} );

	const productName = upgradingPlan?.product_name ?? '';

	const isAtomicSite = !! useSelector( ( state ) => isAtomicSiteSelector( state, siteId ) );

	/*
	 * the site is Ready to Start when:
	 * - siteId is defined
	 * - data is ready
	 * - does not require an upgrade, based on store `woop` feature
	 */
	let isReadyToStart = !! ( siteId && transferringDataIsAvailable && hasWoopFeature );

	// when the site is not Atomic, ...
	if ( isReadyToStart && ! isAtomicSite ) {
		isReadyToStart =
			isReadyToStart &&
			! isTransferringBlocked && // there is no blockers from eligibility (holds).
			! ( eligibilityWarnings && eligibilityWarnings.length ); // there is no warnings from eligibility (warnings).
	}

	const siteUpgrading = {
		required: ! hasWoopFeature,
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
