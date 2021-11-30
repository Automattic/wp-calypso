import { NextButton } from '@automattic/onboarding';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { ReactElement, useEffect } from 'react';
import { default as HoldList } from 'calypso/blocks/eligibility-warnings/hold-list';
import WarningList from 'calypso/blocks/eligibility-warnings/warning-list';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import StepWrapper from 'calypso/signup/step-wrapper';
import useWoopHandling from '../hooks/use-woop-handling';
import type { WooCommerceInstallProps } from '../';

import './style.scss';

export default function Confirm( props: WooCommerceInstallProps ): ReactElement | null {
	const { siteId, goToStep, isReskinned, stepSectionName, headerTitle, headerDescription } = props;
	const { __ } = useI18n();

	const {
		isFetching,
		wpcomDomain,
		stagingDomain,
		eligibilityHolds,
		eligibilityWarnings,
		wpcomSubdomainWarning,
		siteNeedUpgrade,
	} = useWoopHandling( siteId );

	useEffect( () => {
		if ( isFetching ) {
			return;
		}

		if ( ! siteNeedUpgrade ) {
			return;
		}

		window.location.href = siteNeedUpgrade;
	}, [ siteNeedUpgrade, isFetching, wpcomDomain ] );

	const isLoading = ! siteId || isFetching;

	function getWPComSubdomainWarningContent() {
		// Get staging sudomain based on the wpcom subdomain.

		return (
			<>
				<div className="confirm__info-section">{ isLoading && <LoadingEllipsis /> }</div>

				<div className="confirm__instructions-container">
					<div className="confirm__instructions-title confirm__instructions-wpcom-domain">
						{ wpcomDomain }
					</div>

					<div className="confirm__instructions-title">{ stagingDomain }</div>

					<p>
						{ __(
							'By installing this product your subdomain will change. You can change it later to a custom domain and we will pick up the tab for a year.'
						) }
					</p>

					<p>
						{ createInterpolateElement( __( '<a>Contact support</a> for help and questions.' ), {
							a: <a href="#support-link" />,
						} ) }
					</p>

					<NextButton
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
				<div className="confirm__info-section">{ isLoading && <LoadingEllipsis /> }</div>

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

					<NextButton onClick={ () => goToStep( 'transfer' ) }>{ __( 'Confirm' ) }</NextButton>
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
			align={ isReskinned ? 'left' : 'center' }
			stepContent={ getContent() }
			isWideLayout={ isReskinned }
			{ ...props }
		/>
	);
}
