import { NextButton } from '@automattic/onboarding';
import styled from '@emotion/styled';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { ReactElement } from 'react';
import { default as HoldList } from 'calypso/blocks/eligibility-warnings/hold-list';
import WarningList from 'calypso/blocks/eligibility-warnings/warning-list';
import EligibilityWarningsList from 'calypso/components/eligibility-warnings/warnings-list';
import StepWrapper from 'calypso/signup/step-wrapper';
import SignupBanner from '../components/signup-banner';
import SignupCard from '../components/signup-card';
import useEligibility from '../hooks/use-eligibility';
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

	const {
		eligibilityHolds,
		eligibilityWarnings,
		isFetching,
		wpcomSubdomainWarning,
		stagingDomain,
		pluginsWarning,
		hasBlockers,
	} = useEligibility( siteId );

	const isLoading = ! siteId || isFetching;

	function getWPComSubdomainWarningContent() {
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

					{ !! pluginsWarning.length && (
						<p>{ __( 'There are some plugins that would be affected their functionallity.' ) }</p>
					) }

					{ hasBlockers && (
						<p>
							{ __(
								'This is an erro that is stopping the user from proceeding of the reason why the install failed.'
							) }
						</p>
					) }

					<ActionSection>
						<p>
							{ createInterpolateElement( __( 'Need help? <a>Contact support</a>' ), {
								a: <SupportLink href="#support-link" />,
							} ) }
						</p>
						<NextButton
							isBusy={ isLoading }
							disabled={ isLoading || hasBlockers }
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
			wpcomSubdomainWarning &&
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
