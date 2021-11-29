import { NextButton } from '@automattic/onboarding';
import styled from '@emotion/styled';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { ReactElement } from 'react';
import EligibilityWarningsList from 'calypso/components/eligibility-warnings/warnings-list';
import WarningCard from 'calypso/components/warning-card';
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
	align-items: baseline;
`;

const Divider = styled.hr`
	border-top: 1px solid #eee;
	background: none;
	margin-bottom: 40px;
`;

const DomainWarningSection = styled.div`
	margin-bottom: 40px;
`;

const WarningsOrHoldsSection = styled.div`
	margin-bottom: 40px;
`;

export default function Confirm( props: WooCommerceInstallProps ): ReactElement | null {
	const { siteId, goToStep, isReskinned, headerTitle, headerDescription } = props;
	const { __ } = useI18n();

	const {
		isFetching,
		wpcomSubdomainWarning,
		stagingDomain,
		pluginsWarning,
		widgetsWarning,
		hasBlockers,
	} = useEligibility( siteId );

	const isLoading = ! siteId || isFetching;
	const warnings: string[] = [];

	if ( pluginsWarning.length ) {
		warnings.push( __( 'Some plugins behavior would be affected when installing this product.' ) );
	}

	if ( widgetsWarning.length ) {
		warnings.push( __( 'Some widgets behavior would be affected when installing this product.' ) );
	}

	function getWarningsOrHoldsSection() {
		if ( hasBlockers ) {
			return (
				<WarningsOrHoldsSection>
					<Divider />
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
					<SignupCard icon="notice-outline" title={ __( 'Things you should be aware of' ) }>
						<EligibilityWarningsList warnings={ warnings } />
					</SignupCard>
				</WarningsOrHoldsSection>
			);
		}

		return null;
	}

	function getContent() {
		return (
			<>
				<div className="confirm__info-section" />
				<div className="confirm__instructions-container">
					{ wpcomSubdomainWarning && (
						<DomainWarningSection>
							<SignupCard title={ __( 'New Store Domain' ) }>
								<SignupBanner label={ __( 'New' ) }>{ stagingDomain }</SignupBanner>
								<p>
									{ __(
										'By installing this product your subdomain will change. Your old subdomain (sitename.wordpress.com) will no longer work. You can change it to a custom domain on us at anytime in future.'
									) }
								</p>
							</SignupCard>
						</DomainWarningSection>
					) }
					{ getWarningsOrHoldsSection() }
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
