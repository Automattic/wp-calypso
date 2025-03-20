import { ProductsList } from '@automattic/data-stores';
import { StepContainer, NextButton } from '@automattic/onboarding';
import styled from '@emotion/styled';
import { useSelect, useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import QueryEligibility from 'calypso/components/data/query-atat-eligibility';
import DomainEligibilityWarning from 'calypso/components/eligibility-warnings/domain-warning';
import PlanWarning from 'calypso/components/eligibility-warnings/plan-warning';
import EligibilityWarningsList from 'calypso/components/eligibility-warnings/warnings-list';
import FormattedHeader from 'calypso/components/formatted-header';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import WarningCard from 'calypso/components/warning-card';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSitePluginSlug } from 'calypso/landing/stepper/hooks/use-site-plugin-slug';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { addQueryArgs } from 'calypso/lib/url';
import { useSelector } from 'calypso/state';
import { eligibilityHolds as eligibilityHoldsConstants } from 'calypso/state/automated-transfer/constants';
import { getEligibility } from 'calypso/state/automated-transfer/selectors';
import SupportCard from '../store-address/support-card';
import type { Step } from '../../types';
import type { SiteSelect } from '@automattic/data-stores';
import './style.scss';

const ActionSection = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: baseline;
	flex-wrap: wrap;
	margin-top: 40px;
	gap: 4%;

	@media ( max-width: 320px ) {
		align-items: center;
	}
`;

const StyledNextButton = styled( NextButton )`
	@media ( max-width: 320px ) {
		width: 100%;
		margin-bottom: 20px;
	}
`;

const Divider = styled.hr`
	border-top: 1px solid #eee;
	background: none;
	margin-bottom: 40px;
`;

const WarningsOrHoldsSection = styled.div`
	margin-bottom: 40px;
`;

const TRANSFERRING_NOT_BLOCKERS = [
	eligibilityHoldsConstants.NO_BUSINESS_PLAN, // Plans are upgraded in the install flow.
	eligibilityHoldsConstants.TRANSFER_ALREADY_EXISTS, // Already Atomic sites are handled in the install flow.
];

const BundleConfirm: Step< { submits: { checkoutUrl: string } } > = function BundleConfirm( {
	navigation,
} ) {
	const { goBack, submit } = navigation;
	const { __ } = useI18n();
	const site = useSite();
	const siteId = site && site?.ID;
	const pluginSlug = useSitePluginSlug();
	const isAtomicSite = useSelect(
		( select ) => siteId && ( select( SITE_STORE ) as SiteSelect ).isSiteAtomic( siteId ),
		[ siteId ]
	);
	const { requestLatestAtomicTransfer } = useDispatch( SITE_STORE );

	useEffect( () => {
		if ( ! siteId ) {
			return;
		}

		requestLatestAtomicTransfer( siteId );
	}, [ requestLatestAtomicTransfer, siteId ] );

	const { eligibilityHolds, eligibilityWarnings } = useSelector( ( state ) =>
		getEligibility( state, siteId )
	);
	const wpcomSubdomainWarning =
		eligibilityWarnings?.find( ( { id } ) => id === 'wordpress_subdomain' ) ?? null;
	const warnings =
		eligibilityWarnings?.filter( ( { id } ) => id !== 'wordpress_subdomain' ) ?? null;
	const latestAtomicTransfer = useSelect(
		( select ) => ( select( SITE_STORE ) as SiteSelect ).getSiteLatestAtomicTransfer( siteId || 0 ),
		[ siteId ]
	);
	const latestAtomicTransferError = useSelect(
		( select ) =>
			( select( SITE_STORE ) as SiteSelect ).getSiteLatestAtomicTransferError( siteId || 0 ),
		[ siteId ]
	);
	const productsList = useSelect(
		( select ) => select( ProductsList.store ).getProductsList(),
		[]
	);
	const requiresUpgrade = useSelect(
		( select ) => ( select( SITE_STORE ) as SiteSelect ).requiresUpgrade( siteId ),
		[ siteId ]
	);

	const wpcomDomain = site?.URL?.replace( /http[s]*:\/\//, '' );
	const stagingDomain = wpcomDomain?.replace( /\b\.wordpress\.com/, '.wpcomstaging.com' ) || null;

	const productName =
		site?.plan?.features?.available?.woop && site?.plan?.features?.available?.woop[ 0 ];
	const upgradingPlan = productName ? productsList?.[ productName ] : null;

	// Filter the Woop transferring blockers.
	const transferringBlockers = eligibilityHolds?.filter(
		( hold ) => ! TRANSFERRING_NOT_BLOCKERS.includes( hold )
	);

	const isTransferStuck = latestAtomicTransfer?.is_stuck || false;
	const isBlockByTransferStatus = latestAtomicTransferError || false;

	// Add blocked-transfer-hold when something is wrong in the transfer status.
	if (
		! transferringBlockers?.includes( eligibilityHoldsConstants.BLOCKED_ATOMIC_TRANSFER ) &&
		( isBlockByTransferStatus || isTransferStuck )
	) {
		transferringBlockers?.push( eligibilityHoldsConstants.BLOCKED_ATOMIC_TRANSFER );
	}

	const transferringDataIsAvailable =
		typeof transferringBlockers !== 'undefined' &&
		( typeof latestAtomicTransfer !== 'undefined' ||
			typeof latestAtomicTransferError !== 'undefined' );

	const isDataReady = transferringDataIsAvailable;

	/*
	 * the site is Ready to Start when:
	 * - siteId is defined
	 * - data is ready
	 * - does not require an upgrade, based on store `woop` feature
	 */
	let isReadyToStart = !! ( siteId && transferringDataIsAvailable && ! requiresUpgrade );

	/*
	 * Check whether the site transferring is blocked.
	 * True as default, meaning it's True when requesting data.
	 */
	const isTransferringBlocked =
		latestAtomicTransfer && ( ! transferringDataIsAvailable || transferringBlockers?.length > 0 );

	// when the site is not Atomic, ...
	if ( ! isAtomicSite ) {
		isReadyToStart =
			isReadyToStart &&
			! isTransferringBlocked && // there is no blockers from eligibility (holds).
			! ( eligibilityWarnings && eligibilityWarnings?.length ); // there is no warnings from eligibility (warnings).
	}

	const flags = new URLSearchParams( window.location.search ).get( 'flags' );
	const queryArgs = {
		siteSlug: wpcomDomain,
		...( flags ? { flags } : {} ),
	};

	const siteUpgrading = {
		required: requiresUpgrade,
		checkoutUrl: addQueryArgs(
			{
				redirect_to: addQueryArgs( queryArgs, '/setup/plugin-bundle/bundleTransfer' ),
				cancel_to: addQueryArgs( queryArgs, '/setup/plugin-bundle/bundleConfirm' ),
			},
			`/checkout/${ wpcomDomain }/${ upgradingPlan?.product_slug ?? '' }`
		),
		description: __( 'Upgrade to the Business plan and set up your WooCommerce store.' ),
	};

	const domain = stagingDomain;
	const backUrl = window.location.pathname + window.location.search;

	function getWPComSubdomainWarningContent() {
		if ( ! wpcomSubdomainWarning ) {
			return null;
		}

		return (
			<DomainEligibilityWarning wpcomDomain={ wpcomDomain || '' } stagingDomain={ stagingDomain } />
		);
	}

	function getCheckoutContent() {
		if ( ! siteUpgrading.required ) {
			return null;
		}

		return (
			<div className="bundle-confirm__upgrade-required">
				<PlanWarning title={ __( 'Plan upgrade required' ) }>
					{ siteUpgrading.description }
				</PlanWarning>
			</div>
		);
	}

	function getWarningsOrHoldsSection() {
		if ( isTransferringBlocked ) {
			return (
				<WarningsOrHoldsSection>
					<WarningCard
						message={ __(
							'There is an error that is stopping us from being able to install this product, please contact support.'
						) }
					/>
				</WarningsOrHoldsSection>
			);
		}

		if ( warnings?.length ) {
			return (
				<WarningsOrHoldsSection>
					<Divider />
					<EligibilityWarningsList warnings={ warnings } />
				</WarningsOrHoldsSection>
			);
		}

		return null;
	}

	function getContent() {
		return (
			<>
				<QueryEligibility siteId={ siteId } />
				<div className="bundle-confirm__info-section" />
				<div className="bundle-confirm__instructions-container">
					{ getWPComSubdomainWarningContent() }
					{ getCheckoutContent() }
					{ getWarningsOrHoldsSection() }
					<ActionSection>
						<SupportCard domain={ domain || '' } backUrl={ backUrl } />
						<StyledNextButton
							disabled={ isTransferringBlocked || ! isDataReady }
							onClick={ () => {
								const eventProperties = {
									site: wpcomDomain,
									upgrade_required: siteUpgrading.required,
								};

								recordTracksEvent( 'calypso_bundle_dashboard_confirm_submit', {
									...eventProperties,
									software_set: pluginSlug,
								} );

								// For backward compatibility with existing event. When it's not used anymore, it can be removed.
								if ( 'woo-on-plans' === pluginSlug ) {
									recordTracksEvent(
										'calypso_woocommerce_dashboard_confirm_submit',
										eventProperties
									);
								}

								const providedDependencies = {
									checkoutUrl: siteUpgrading.required ? siteUpgrading.checkoutUrl : '',
								};

								submit?.( providedDependencies );
							} }
						>
							{ __( 'Confirm' ) }
						</StyledNextButton>
					</ActionSection>
				</div>
			</>
		);
	}

	if ( site === null || ! site.ID || ! isDataReady || isReadyToStart ) {
		return (
			<div className="bundle-confirm__loading-container">
				<QueryEligibility siteId={ siteId } />
				<LoadingEllipsis />
			</div>
		);
	}

	const headerText = __( 'One final step' );
	const subHeaderText = __(
		"We've highlighted a few important details you should review before we create your store."
	);

	return (
		<StepContainer
			stepName="bundle-confirm"
			goBack={ goBack }
			hideSkip
			isHorizontalLayout
			formattedHeader={
				<FormattedHeader
					id="bundle-confirm-title-header"
					headerText={ headerText }
					subHeaderText={ subHeaderText }
					align="left"
				/>
			}
			stepContent={ getContent() }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default BundleConfirm;
