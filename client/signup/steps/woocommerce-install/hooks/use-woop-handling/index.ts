import { FEATURE_WOOP } from '@automattic/calypso-products';
import { sprintf, __ } from '@wordpress/i18n';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addQueryArgs } from 'calypso/lib/url';
import {
	fetchAutomatedTransferStatusOnce,
	requestEligibility,
} from 'calypso/state/automated-transfer/actions';
import { eligibilityHolds as eligibilityHoldsConstants } from 'calypso/state/automated-transfer/constants';
import {
	isFetchingAutomatedTransferStatus,
	getEligibility,
	EligibilityData,
	EligibilityWarning,
} from 'calypso/state/automated-transfer/selectors';
import { requestProductsList } from 'calypso/state/products-list/actions';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import hasActiveSiteFeature from 'calypso/state/selectors/has-active-site-feature';
import hasAvailableSiteFeature from 'calypso/state/selectors/has-available-site-feature';
import { getSiteDomain } from 'calypso/state/sites/selectors';

const TRANSFERRING_NOT_BLOCKERS = [
	eligibilityHoldsConstants.NO_BUSINESS_PLAN, // let's redirect to checkout page
	eligibilityHoldsConstants.TRANSFER_ALREADY_EXISTS, // let's handle it in transferring endpoint.
];

type EligibilityHook = {
	eligibilityHolds?: string[];
	eligibilityWarnings?: EligibilityWarning[];
	isFetching: boolean;
	wpcomDomain: string | null;
	stagingDomain: string | null;
	pluginsWarning: EligibilityWarning[];
	widgetsWarning: EligibilityWarning[];
	wpcomSubdomainWarning: EligibilityWarning | undefined;
	transferringBlockers: string[];
	hasBlockers: boolean;
	siteUpgrading: {
		required: boolean;
		checkoutUrl: string;
		checkoutText: string;
		productName: string;
		description: string;
	};
};

export default function useEligibility( siteId: number ): EligibilityHook {
	const dispatch = useDispatch();

	// Request eligibility data.
	useEffect( () => {
		if ( ! siteId ) {
			return;
		}

		dispatch( fetchAutomatedTransferStatusOnce( siteId ) );
		dispatch( requestEligibility( siteId ) );
		dispatch( requestProductsList() );
	}, [ siteId, dispatch ] );

	// Get eligibility data.
	const { eligibilityHolds, eligibilityWarnings }: EligibilityData = useSelector( ( state ) =>
		getEligibility( state, siteId )
	);

	// Pick the wpcom subdomain.
	const wpcomDomain = useSelector( ( state ) => getSiteDomain( state, siteId ) );

	// Get staging sudomain based on the wpcom subdomain.
	const stagingDomain = wpcomDomain?.replace( /\b\.wordpress\.com/, '.wpcomstaging.com' ) || null;

	// Check whether it's requesting eligibility data.
	const isFetching = !! useSelector( ( state ) =>
		isFetchingAutomatedTransferStatus( state, siteId )
	);

	// Check whether the wpcom.com subdomain warning is present.
	const wpcomSubdomainWarning = eligibilityWarnings?.find(
		( { id } ) => id === 'wordpress_subdomain'
	);

	// Plugins warnings
	const pluginsWarning = eligibilityWarnings?.filter( ( { type } ) => type === 'plugins' ) || [];

	// Widgets warnings
	const widgetsWarning = eligibilityWarnings?.filter( ( { type } ) => type === 'widgets' ) || [];

	// Trasferring blockers
	const transferringBlockers =
		eligibilityHolds?.filter( ( hold ) => ! TRANSFERRING_NOT_BLOCKERS.includes( hold ) ) || [];

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
	const isWoopFeatureActive = useSelector( ( state ) =>
		hasActiveSiteFeature( state, siteId, FEATURE_WOOP )
	);
	const hasWoopFeatureAvailable = useSelector( ( state ) =>
		hasAvailableSiteFeature( state, siteId, FEATURE_WOOP )
	);

	const requiresUpgrade = Boolean(
		eligibilityNoProperPlan && ! isWoopFeatureActive && hasWoopFeatureAvailable
	);

	/*
	 * We pick the first plan from the available plans list.
	 * The priority is defined by the store products list.
	 */
	const upgradingPlan =
		useSelector( ( state ) => getProductBySlug( state, hasWoopFeatureAvailable?.[ 0 ] ) ) || {};

	const productName = upgradingPlan.product_name;

	const siteUpgrading = {
		required: requiresUpgrade,
		checkoutUrl: addQueryArgs(
			{ redirect_to: window.location.href },
			`/checkout/${ wpcomDomain }/${ upgradingPlan.product_slug }`
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
		isFetching,
		eligibilityHolds,
		eligibilityWarnings,
		wpcomDomain,
		stagingDomain,
		pluginsWarning,
		widgetsWarning,
		wpcomSubdomainWarning,

		transferringBlockers,
		hasBlockers: !! transferringBlockers.length,
		siteUpgrading,
	};
}
