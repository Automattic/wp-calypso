import page from '@automattic/calypso-router';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import DomainEligibilityWarning from 'calypso/components/eligibility-warnings/domain-warning';
import PlanWarning from 'calypso/components/eligibility-warnings/plan-warning';
import EligibilityWarningsList from 'calypso/components/eligibility-warnings/warnings-list';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import WarningCard from 'calypso/components/warning-card';
import StepWrapper from 'calypso/signup/step-wrapper';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { ActionSection, StyledNextButton } from '..';
import SupportCard from '../components/support-card';
import useWooCommerceOnPlansEligibility from '../hooks/use-woop-handling';
import type { WooCommerceInstallProps } from '../';
import './style.scss';

const Divider = styled.hr`
	border-top: 1px solid #eee;
	background: none;
	margin-bottom: 40px;
`;

const WarningsOrHoldsSection = styled.div`
	margin-bottom: 40px;
`;

export default function Confirm( props: WooCommerceInstallProps ) {
	const { goToNextStep } = props;
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
							} }
						>
							{ __( 'Confirm' ) }
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
			hideSkip
			nextLabelText={ __( 'Confirm' ) }
			headerText={ __( 'One final step' ) }
			fallbackHeaderText={ __( 'One final step' ) }
			subHeaderText={ __(
				'We’ve highlighted a few important details you should review before we create your store.'
			) }
			fallbackSubHeaderText={ __(
				'We’ve highlighted a few important details you should review before we create your store.'
			) }
			align="left"
			stepContent={ getContent() }
			isWideLayout
			{ ...props }
		/>
	);
}
