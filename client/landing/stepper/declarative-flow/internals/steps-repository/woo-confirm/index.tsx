import { AutomatedTransferEligibility, ProductsList } from '@automattic/data-stores';
import { StepContainer } from '@automattic/onboarding';
import styled from '@emotion/styled';
import { useSelect, useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import DomainEligibilityWarning from 'calypso/components/eligibility-warnings/domain-warning';
import PlanWarning from 'calypso/components/eligibility-warnings/plan-warning';
import EligibilityWarningsList from 'calypso/components/eligibility-warnings/warnings-list';
import FormattedHeader from 'calypso/components/formatted-header';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import WarningCard from 'calypso/components/warning-card';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { SITE_STORE, ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { addQueryArgs } from 'calypso/lib/url';
import { ActionSection, StyledNextButton } from 'calypso/signup/steps/woocommerce-install';
import { eligibilityHolds as eligibilityHoldsConstants } from 'calypso/state/automated-transfer/constants';
import SupportCard from '../store-address/support-card';
import type { Step } from '../../types';
import type { OnboardSelect, SiteSelect } from '@automattic/data-stores';
import './style.scss';

const {
	store: transferStore,
	getEligibilityHolds,
	getEligibilityWarnings,
	getNonSubdomainWarnings,
	getWpcomSubdomainWarning,
} = AutomatedTransferEligibility;

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

const WooConfirm: Step = function WooCommerceConfirm( { navigation } ) {
	const { goBack, submit } = navigation;
	const { __ } = useI18n();
	const site = useSite();
	const siteId = site && site?.ID;

	const { requestLatestAtomicTransfer } = useDispatch( SITE_STORE );
	useEffect( () => {
		if ( ! siteId ) {
			return;
		}
		requestLatestAtomicTransfer( siteId );
	}, [ requestLatestAtomicTransfer, siteId ] );

	const { eligibilityHolds, eligibilityWarnings, wpcomSubdomainWarning, warnings } = useSelect(
		( select ) => {
			const eligibility = select( transferStore ).getAutomatedTransferEligibility( siteId );
			return {
				eligibilityHolds: getEligibilityHolds( eligibility ),
				eligibilityWarnings: getEligibilityWarnings( eligibility ),
				wpcomSubdomainWarning: getWpcomSubdomainWarning( eligibility ),
				warnings: getNonSubdomainWarnings( eligibility ),
			};
		},
		[ siteId ]
	);

	const { latestAtomicTransfer, latestAtomicTransferError, requiresUpgrade, isAtomicSite } =
		useSelect(
			( select ) => {
				const selectors = select( SITE_STORE ) as SiteSelect;
				return {
					latestAtomicTransfer: selectors.getSiteLatestAtomicTransfer( siteId || 0 ),
					latestAtomicTransferError: selectors.getSiteLatestAtomicTransferError( siteId || 0 ),
					requiresUpgrade: selectors.requiresUpgrade( siteId ),
					isAtomicSite: siteId && selectors.isSiteAtomic( siteId ),
				};
			},
			[ siteId ]
		);

	const productsList = useSelect(
		( select ) => select( ProductsList.store ).getProductsList(),
		[]
	);
	const stepProgress = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getStepProgress(),
		[]
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
		! transferringBlockers?.includes( 'BLOCKED_ATOMIC_TRANSFER' ) &&
		( isBlockByTransferStatus || isTransferStuck )
	) {
		transferringBlockers?.push( 'BLOCKED_ATOMIC_TRANSFER' );
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
				redirect_to: addQueryArgs( queryArgs, '/setup/plugin-bundle/wooTransfer' ),
				cancel_to: addQueryArgs( queryArgs, '/setup/plugin-bundle/wooConfirm' ),
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
			<div className="woo-confirm__upgrade-required">
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
				<div className="woo-confirm__info-section" />
				<div className="woo-confirm__instructions-container">
					{ getWPComSubdomainWarningContent() }
					{ getCheckoutContent() }
					{ getWarningsOrHoldsSection() }
					<ActionSection>
						<SupportCard domain={ domain || '' } backUrl={ backUrl } />
						<StyledNextButton
							disabled={ isTransferringBlocked || ! isDataReady }
							onClick={ () => {
								recordTracksEvent( 'calypso_woocommerce_dashboard_confirm_submit', {
									site: wpcomDomain,
									upgrade_required: siteUpgrading.required,
								} );

								const providedDependencies = {
									checkoutUrl: siteUpgrading.checkoutUrl,
								};
								submit?.(
									providedDependencies,
									siteUpgrading.required ? siteUpgrading.checkoutUrl : ''
								);
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
			<div className="woo-confirm__loading-container">
				<LoadingEllipsis />
			</div>
		);
	}

	const headerText = __( 'One final step' );
	const subHeaderText = __(
		'We’ve highlighted a few important details you should review before we create your store. '
	);

	return (
		<StepContainer
			stepName="woo-confirm"
			goBack={ goBack }
			hideSkip
			isHorizontalLayout={ true }
			formattedHeader={
				<FormattedHeader
					id="woo-confirm-title-header"
					headerText={ headerText }
					subHeaderText={ subHeaderText }
					align="left"
				/>
			}
			stepContent={ getContent() }
			stepProgress={ stepProgress }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default WooConfirm;
