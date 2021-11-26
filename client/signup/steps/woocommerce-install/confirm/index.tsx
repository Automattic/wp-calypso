import { NextButton } from '@automattic/onboarding';
import { createInterpolateElement } from '@wordpress/element';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { ReactElement, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { default as HoldList } from 'calypso/blocks/eligibility-warnings/hold-list';
import WarningList from 'calypso/blocks/eligibility-warnings/warning-list';
import StepWrapper from 'calypso/signup/step-wrapper';
import DomainEligibilityWarning from 'calypso/components/eligibility-warnings/domain-warning';
import EligibilityWarningsList from 'calypso/components/eligibility-warnings/warnings-list';
import {
	fetchAutomatedTransferStatusOnce,
	requestEligibility,
} from 'calypso/state/automated-transfer/actions';
import {
	isFetchingAutomatedTransferStatus,
	getEligibility,
	EligibilityData,
} from 'calypso/state/automated-transfer/selectors';
import { getSiteDomain } from 'calypso/state/sites/selectors';
import SignupBanner from '../components/signup-banner';
import SignupCard from '../components/signup-card';
import type { WooCommerceInstallProps } from '../';

import './style.scss';

const SupportLink = styled.a`
	/* Gray / Gray 100 - have to find the var value for this color */
	color: #101517 !important;
	text-decoration: underline;
	font-weight: bold;
`;

const ActionSection = styled.div`
	display: flex;
	justify-content: space-between;
	margin-top: 40px;
	align-items: baseline;
`;

export default function Confirm( props: WooCommerceInstallProps ): ReactElement | null {
	const { siteId, goToStep, isReskinned, stepSectionName, headerTitle, headerDescription } = props;
	const { __ } = useI18n();
	const dispatch = useDispatch();

	// Request eligibility data.
	useEffect( () => {
		if ( ! siteId ) {
			return;
		}
		dispatch( fetchAutomatedTransferStatusOnce( siteId ) );
		dispatch( requestEligibility( siteId ) );
	}, [ siteId, dispatch ] );

	// Check whether it's requesting eligibility data.
	const isFetchingTransferStatus = !! useSelector( ( state ) =>
		isFetchingAutomatedTransferStatus( state, siteId )
	);

	// Get eligibility data.
	const {
		eligibilityHolds,
		eligibilityWarnings: allEligibilityWarnings,
	}: EligibilityData = useSelector( ( state ) => getEligibility( state, siteId ) );

	// Check whether the wpcom.com subdomain warning is present.
	const wordPressSubdomainWarning = allEligibilityWarnings?.find(
		( { id } ) => id === 'wordpress_subdomain'
	);

	/*const eligibilityWarnings = allEligibilityWarnings?.filter(
		( { id } ) => id !== 'wordpress_subdomain'
	);*/

	// remove this before sending to production
	const eligibilityWarnings = [
		{
			name: 'Warning #1',
			description: 'This is a warning.',
			supportUrl: '/',
		},
		{
			name: 'Warning #2',
			description: 'This is a warning that may need attention.',
			supportUrl: '/',
		},
	];

	// Pick the wpcom subdomain.
	const wpcomDomain = useSelector( ( state ) => getSiteDomain( state, siteId ) );

	const isLoading = ! siteId || isFetchingTransferStatus;

	function getWPComSubdomainWarningContent() {
		// Get staging sudomain based on the wpcom subdomain.
		const stagingDomain = wpcomDomain?.replace( /\b\.wordpress\.com/, '.wpcomstaging.com' );

		return (
			<>
				<div className="confirm__info-section" />
				<div className="confirm__instructions-container">
					<SignupCard title={ __( 'New Store Domain' ) }>
						<SignupBanner label={ __( 'New' ) }>{ stagingDomain }</SignupBanner>

						<p>
							{ __(
								'By installing this product your subdomain will change. Your old subdomain (sitename.wordpress.com) will no longer work. You can change it to a custom domain on us at anytime in future.'
							) }
						</p>
					</SignupCard>
					{ !! eligibilityWarnings?.length && (
						<SignupCard icon="notice-outline" title={ __( 'Things you should be aware of' ) }>
							<EligibilityWarningsList warnings={ eligibilityWarnings } />
						</SignupCard>
					) }
					<ActionSection>
						<p>
							{ createInterpolateElement( __( 'Need help? <a>Contact support</a>' ), {
								a: <SupportLink href="#support-link" />,
							} ) }
						</p>
						<NextButton
							isBusy={ isLoading }
							disabled={ isLoading }
							onClick={ () => goToStep( 'transfer' ) }
						>
							{ __( 'Create my Store' ) }
						</NextButton>
					</ActionSection>
				</div>
			</>
		);
	}

	function getContent() {
		// wpcom subdomain warning.
		if (
			wordPressSubdomainWarning &&
			( stepSectionName === 'wpcom_subdomain_substep' || typeof stepSectionName === 'undefined' )
		) {
			return getWPComSubdomainWarningContent();
		}

		return (
			<>
				<div className="confirm__info-section" />

				<div className="confirm__instructions-container">
					{ !! eligibilityHolds?.length && (
						<p>
							<HoldList holds={ eligibilityHolds } context={ 'plugins' } isPlaceholder={ false } />
						</p>
					) }
					{ !! eligibilityWarnings?.length && (
						<p>
							<WarningList warnings={ eligibilityWarnings } context={ 'plugins' } />
						</p>
					) }

					<NextButton
						isBusy={ isLoading }
						disabled={ isLoading }
						onClick={ () => goToStep( 'transfer' ) }
					>
						{ __( 'Confirm' ) }
					</NextButton>
				</div>
			</>
		);
	}

	return (
		<StepWrapper
			flowName="woocommerce-install"
			hideSkip={ true }
			nextLabelText={ __( 'Confirm' ) }
			allowBackFirstStep={ true }
			backUrl="select-site"
			headerText={ headerTitle }
			fallbackHeaderText={ headerTitle }
			subHeaderText={ headerDescription }
			fallbackSubHeaderText={ headerDescription }
			stepContent={ getContent() }
			isWideLayout={ isReskinned }
			{ ...props }
		/>
	);
}
