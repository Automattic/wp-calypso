import { NextButton } from '@automattic/onboarding';
import styled from '@emotion/styled';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { ReactElement, useEffect } from 'react';
import { useSelector } from 'react-redux';
import DomainEligibilityWarning from 'calypso/components/eligibility-warnings/domain-warning';
import PlanWarning from 'calypso/components/eligibility-warnings/plan-warning';
import EligibilityWarningsList from 'calypso/components/eligibility-warnings/warnings-list';
import WarningCard from 'calypso/components/warning-card';
import StepWrapper from 'calypso/signup/step-wrapper';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useWooCommerceOnPlansEligibility from '../hooks/use-woop-handling';
import type { WooCommerceInstallProps } from '../';

import './style.scss';

const SupportLinkStyle = styled.a`
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

const WarningsOrHoldsSection = styled.div`
	margin-bottom: 40px;
`;

function SupportLink() {
	return (
		<p>
			{ createInterpolateElement( __( 'Need help? <a>Contact support</a>' ), {
				a: <SupportLinkStyle href="#support-link" />,
			} ) }
		</p>
	);
}

export default function Confirm( props: WooCommerceInstallProps ): ReactElement | null {
	const { goToStep, isReskinned, headerTitle, headerDescription } = props;
	const { __ } = useI18n();

	// selectedSiteId is set by the controller whenever site is provided as a query param.
	const siteId = useSelector( getSelectedSiteId ) as number;

	const {
		wpcomDomain,
		stagingDomain,
		wpcomSubdomainWarning,
		siteUpgrading,
		hasBlockers,
		warnings,
		isReadyForTransfer,
	} = useWooCommerceOnPlansEligibility( siteId );

	// Skip to transfer step if the site is ready for transfer.
	useEffect( () => {
		if ( ! isReadyForTransfer ) {
			return;
		}

		goToStep( 'transfer' );
	}, [ goToStep, isReadyForTransfer ] );

	function getWPComSubdomainWarningContent() {
		if ( ! wpcomSubdomainWarning ) {
			return null;
		}

		return <DomainEligibilityWarning wpcomDomain={ wpcomDomain } stagingDomain={ stagingDomain } />;
	}

	function getCheckoutContent() {
		if ( ! siteUpgrading.required ) {
			return null;
		}

		return (
			<PlanWarning title={ __( 'Upgrade your plan' ) }>{ siteUpgrading.description }</PlanWarning>
		);
	}

	function getWarningsOrHoldsSection() {
		if ( hasBlockers ) {
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
		if ( ! siteId ) {
			return null;
		}

		return (
			<>
				<div className="confirm__info-section" />
				<div className="confirm__instructions-container">
					{ getWPComSubdomainWarningContent() }
					{ getCheckoutContent() }
					{ getWarningsOrHoldsSection() }
					<ActionSection>
						<SupportLink />
						<NextButton
							disabled={ hasBlockers }
							onClick={ () => {
								if ( siteUpgrading.required ) {
									return ( window.location.href = siteUpgrading.checkoutUrl );
								}
								goToStep( 'transfer' );
							} }
						>
							{ __( 'Sounds good' ) }
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
