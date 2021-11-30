import { NextButton } from '@automattic/onboarding';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { default as HoldList } from 'calypso/blocks/eligibility-warnings/hold-list';
import WarningList from 'calypso/blocks/eligibility-warnings/warning-list';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import StepWrapper from 'calypso/signup/step-wrapper';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useWooCommerceOnPlansEligibility from '../hooks/use-woop-handling';
import type { WooCommerceInstallProps } from '../';

import './style.scss';

export default function Confirm( props: WooCommerceInstallProps ): ReactElement | null {
	const { goToStep, isReskinned, stepSectionName, headerTitle, headerDescription } = props;
	const { __ } = useI18n();

	// selectedSiteId is set by the controller whenever site is provided as a query param.
	const siteId = useSelector( getSelectedSiteId ) as number;

	const {
		isFetching,
		wpcomDomain,
		stagingDomain,
		eligibilityHolds,
		eligibilityWarnings,
		wpcomSubdomainWarning,
		siteUpgrading,
	} = useWooCommerceOnPlansEligibility( siteId );

	const isLoading = ! siteId || isFetching;

	function getWPComSubdomainWarningContent() {
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
							return goToStep( 'confirm', 'plan' );
						} }
					>
						{ __( 'Sounds good' ) }
					</NextButton>
				</div>
			</>
		);
	}

	function getCheckoutContent() {
		return (
			<>
				<div className="confirm__info-section">{ isLoading && <LoadingEllipsis /> }</div>

				<div className="confirm__instructions-container">
					<div className="confirm__instructions-title">{ __( 'Upgrading is required' ) }</div>

					<p>{ siteUpgrading.description }</p>

					<NextButton
						disabled={ isLoading }
						onClick={ () => {
							window.location.href = siteUpgrading.checkoutUrl;
						} }
					>
						{ siteUpgrading.checkoutText }
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

		// Check/confirm checkout site plan.
		if ( siteUpgrading.required && stepSectionName === 'plan' ) {
			return getCheckoutContent();
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
			backUrl={ `/woocommerce-installation/${ wpcomDomain }` }
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
