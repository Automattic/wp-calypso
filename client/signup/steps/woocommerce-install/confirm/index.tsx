import { NextButton } from '@automattic/onboarding';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { ReactElement } from 'react';
import { default as HoldList } from 'calypso/blocks/eligibility-warnings/hold-list';
import WarningList from 'calypso/blocks/eligibility-warnings/warning-list';
import StepWrapper from 'calypso/signup/step-wrapper';
import SignupBanner from '../components/signup-banner';
import SignupCard from '../components/signup-card';
import useEligibility from '../hooks/use-eligibility';
import type { WooCommerceInstallProps } from '../';

import './style.scss';

export default function Confirm( props: WooCommerceInstallProps ): ReactElement | null {
	const { siteId, goToStep, isReskinned, stepSectionName, headerTitle, headerDescription } = props;
	const { __ } = useI18n();

	const {
		eligibilityHolds,
		eligibilityWarnings,
		isFetchingTransferStatus,
		wpcomSubdomainWarning,
		stagingDomain,
	} = useEligibility( siteId );

	const isLoading = ! siteId || isFetchingTransferStatus;

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

						<p>
							{ createInterpolateElement( __( '<a>Contact support</a> for help and questions.' ), {
								a: <a href="#support-link" />,
							} ) }
						</p>

						<NextButton
							isBusy={ isLoading }
							disabled={ isLoading }
							onClick={ () => {
								if ( eligibilityHolds?.length || eligibilityWarnings?.length ) {
									return goToStep( 'confirm', 'eligibility_substep' );
								}

								return goToStep( 'transfer' );
							} }
						>
							{ __( 'Sounds good' ) }
						</NextButton>
					</SignupCard>
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
