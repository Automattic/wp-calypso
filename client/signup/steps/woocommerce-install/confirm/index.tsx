import { NextButton } from '@automattic/onboarding';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import page from 'page';
import { ReactElement, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import DomainEligibilityWarning from 'calypso/components/eligibility-warnings/domain-warning';
import PlanWarning from 'calypso/components/eligibility-warnings/plan-warning';
import EligibilityWarningsList from 'calypso/components/eligibility-warnings/warnings-list';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import WarningCard from 'calypso/components/warning-card';
import StepWrapper from 'calypso/signup/step-wrapper';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import SupportCard from '../components/support-card';
import useWooCommerceOnPlansEligibility from '../hooks/use-woop-handling';
import type { WooCommerceInstallProps } from '../';
import './style.scss';

export const ActionSection = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: baseline;
	flex-wrap: wrap;

	@media ( max-width: 320px ) {
		align-items: center;
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

export const StyledNextButton = styled( NextButton )`
	@media ( max-width: 320px ) {
		width: 100%;
		margin-bottom: 20px;
	}
`;

export default function Confirm( props: WooCommerceInstallProps ): ReactElement | null {
	const { goToNextStep, isReskinned, headerTitle, headerDescription } = props;
	const { __ } = useI18n();
	const dispatch = useDispatch();

	// selectedSiteId is set by the controller whenever site is provided as a query param.
	const siteId = useSelector( getSelectedSiteId ) as number;

	const {
		wpcomDomain,
		stagingDomain,
		wpcomSubdomainWarning,
		siteUpgrading,
		isTransferringBlocked,
		isDataReady,
		warnings,
		isReadyToStart,
	} = useWooCommerceOnPlansEligibility( siteId );

	useEffect( () => {
		// Automatically start the transfer process when it's ready.
		if ( isReadyToStart ) {
			dispatch( submitSignupStep( { stepName: 'confirm' }, { siteConfirmed: siteId } ) );
			goToNextStep();
		}
	}, [ dispatch, goToNextStep, siteId, isDataReady, isReadyToStart ] );

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
				<div className="confirm__info-section" />
				<div className="confirm__instructions-container">
					{ getWPComSubdomainWarningContent() }
					{ getCheckoutContent() }
					{ getWarningsOrHoldsSection() }
					<ActionSection>
						<SupportCard />
						<StyledNextButton
							disabled={ isTransferringBlocked || ! isDataReady }
							onClick={ () => {
								dispatch( submitSignupStep( { stepName: 'confirm' }, { siteConfirmed: siteId } ) );
								if ( siteUpgrading.required ) {
									page( siteUpgrading.checkoutUrl );
									return;
								}
								goToNextStep();
							} }
						>
							{ __( 'Sounds good' ) }
						</StyledNextButton>
					</ActionSection>
				</div>
			</>
		);
	}

	if ( ! siteId || ! isDataReady || isReadyToStart ) {
		return (
			<div className="confirm__info-section">
				<LoadingEllipsis />
			</div>
		);
	}

	return (
		<StepWrapper
			flowName="woocommerce-install"
			hideSkip={ true }
			nextLabelText={ __( 'Confirm' ) }
			allowBackFirstStep={ ! isEnabled( 'woop' ) }
			backUrl={ isEnabled( 'woop' ) ? null : `/woocommerce-installation/${ wpcomDomain }` }
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
