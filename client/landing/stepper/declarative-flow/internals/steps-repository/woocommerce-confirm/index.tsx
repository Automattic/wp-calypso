import { Button } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import styled from '@emotion/styled';
import { useSelect } from '@wordpress/data';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import DomainEligibilityWarning from 'calypso/components/eligibility-warnings/domain-warning';
import PlanWarning from 'calypso/components/eligibility-warnings/plan-warning';
import EligibilityWarningsList from 'calypso/components/eligibility-warnings/warnings-list';
import FormattedHeader from 'calypso/components/formatted-header';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import WarningCard from 'calypso/components/warning-card';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import {
	WOOCOMMERCE_ELIGIBILITY_STORE,
	SITE_STORE,
	PRODUCTS_LIST_STORE,
} from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { addQueryArgs } from 'calypso/lib/url';
import { ActionSection, StyledNextButton } from 'calypso/signup/steps/woocommerce-install';
import { eligibilityHolds as eligibilityHoldsConstants } from 'calypso/state/automated-transfer/constants';
import SupportCard from '../store-address/support-card';
//import useWooCommerceOnPlansEligibility from 'calypso/signup/steps/woocommerce-install/hooks/use-woop-handling';
import type { Step } from '../../types';
import './style.scss';

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

const WooCommerceConfirm: Step = function WooCommerceConfirm( { navigation } ) {
	const { goBack, submit } = navigation;
	const { __ } = useI18n();
	const site = useSite();
	const siteId = site && site?.ID;
	const eligibilityHolds = useSelect( ( select ) =>
		select( WOOCOMMERCE_ELIGIBILITY_STORE ).getEligibilityHolds( siteId )
	);
	const eligibilityWarnings = useSelect( ( select ) =>
		select( WOOCOMMERCE_ELIGIBILITY_STORE ).getEligibilityWarnings( siteId )
	);
	const wpcomSubdomainWarning = useSelect( ( select ) =>
		select( WOOCOMMERCE_ELIGIBILITY_STORE ).getWpcomSubdomainWarning( siteId )
	);
	const warnings = useSelect( ( select ) =>
		select( WOOCOMMERCE_ELIGIBILITY_STORE ).getNonSubdomainWarnings( siteId )
	);
	const latestAtomicTransfer = useSelect( ( select ) =>
		select( SITE_STORE ).getSiteLatestAtomicTransfer( siteId || 0 )
	);
	const latestAtomicTransferError = useSelect( ( select ) =>
		select( SITE_STORE ).getSiteLatestAtomicTransferError( siteId || 0 )
	);
	const productsList = useSelect( ( select ) => select( PRODUCTS_LIST_STORE ).getProductsList() );
	const requiresUpgrade = useSelect( ( select ) => select( SITE_STORE ).requiresUpgrade( siteId ) );

	const wpcomDomain = site?.URL?.replace( /http[s]*:\/\//, '' );
	const stagingDomain = wpcomDomain?.replace( /\b\.wordpress\.com/, '.wpcomstaging.com' ) || null;

	const productName =
		site?.plan?.features?.available?.woop && site?.plan?.features?.available?.woop[ 0 ];
	const upgradingPlan = productsList && productName && productsList[ productName ];

	// Filter the Woop transferring blockers.
	console.log( { eligibilityHolds } );
	const transferringBlockers = eligibilityHolds?.filter(
		( hold: string ) => ! TRANSFERRING_NOT_BLOCKERS.includes( hold )
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

	console.group( '' );
	console.log( { transferringDataIsAvailable } );
	console.log( { transferringBlockers } );
	console.log( { latestAtomicTransfer } );
	console.log( { latestAtomicTransferError } );
	console.groupEnd();

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
	const isTransferringBlocked = ! transferringDataIsAvailable || transferringBlockers?.length > 0;

	const isAtomicSite = true; // TODO - dummy

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
					'/start/woocommerce-install/transfer' // TODO - May need to update this url
				),
				cancel_to: addQueryArgs( { siteSlug: wpcomDomain }, '/setup/woocommerceConfirm' ),
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

	useEffect(
		() => {
			// TODO - Need to figure out how to handle this
			/*
		// Automatically start the transfer process when it's ready.
		if ( isReadyToStart ) {
			dispatch( submitSignupStep( { stepName: 'confirm' }, { siteConfirmed: siteId } ) );
			goToNextStep();
		}
		*/
		},
		[] /*[ dispatch, goToNextStep, site, isDataReady, isReadyToStart ]*/
	);

	// TODO - Replace with `useSiteDomains` once that gets merged in
	const domain = '';
	const backUrl = '';

	console.log(
		`site: ${
			site !== null
		}, siteId: ${ siteId }, isDataReady: ${ isDataReady }, isReadyToStart: ${ isReadyToStart }`
	);

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
			<PlanWarning title={ __( 'Plan upgrade required' ) }>
				{ siteUpgrading.description }
			</PlanWarning>
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

		if ( warnings.length ) {
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
				<div className="woocommerce-confirm__info-section" />
				<div className="woocommerce-confirm__instructions-container">
					{ getWPComSubdomainWarningContent() }
					{ getCheckoutContent() }
					{ getWarningsOrHoldsSection() }
					<ActionSection>
						<SupportCard domain={ domain } backUrl={ backUrl } />
						<StyledNextButton
							disabled={ isTransferringBlocked || ! isDataReady }
							onClick={ () => {
								/*
								dispatch( submitSignupStep( { stepName: 'confirm' }, { siteConfirmed: siteId } ) );
								dispatch(
									recordTracksEvent( 'calypso_woocommerce_dashboard_confirm_submit', {
										site: wpcomDomain,
										upgrade_required: siteUpgrading.required,
									} )
								);
								if ( siteUpgrading.required ) {
									page( siteUpgrading.checkoutUrl );
									return;
								}
								goToNextStep();
								*/

								submit?.();
							} }
						>
							{ __( 'Confirm' ) }
						</StyledNextButton>
					</ActionSection>
				</div>
			</>
		);
	}

	if ( site === null || ! site.ID || ! isDataReady || ! isReadyToStart ) {
		return (
			<div className="woocommerce-confirm__info-section">
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
			stepName={ 'woocommerce-confirm' }
			goBack={ goBack }
			hideSkip
			isHorizontalLayout={ true }
			formattedHeader={
				<FormattedHeader
					id={ 'woocommerce-confirm-title-header' }
					headerText={ headerText }
					subHeaderText={ subHeaderText }
					align={ 'left' }
				/>
			}
			stepContent={ getContent() }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default WooCommerceConfirm;
