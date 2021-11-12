import { NextButton } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import { ReactElement, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import StepWrapper from 'calypso/signup/step-wrapper';
import {
	fetchAutomatedTransferStatusOnce,
	requestEligibility,
} from 'calypso/state/automated-transfer/actions';
import {
	isFetchingAutomatedTransferStatus,
	getEligibility,
	EligibilityData,
} from 'calypso/state/automated-transfer/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { GoToStep } from '../../types';
import type { AppState } from 'calypso/types';

import './style.scss';
interface Props {
	goToStep: GoToStep;
	isReskinned: boolean;
}

export default function ConfirmWordPressSubdoamin( {
	goToStep,
	isReskinned,
}: Props ): ReactElement | null {
	const { __ } = useI18n();

	const siteId = useSelector( getSelectedSiteId ) as number;

	const dispatch = useDispatch();
	useEffect( () => {
		if ( ! siteId ) {
			return;
		}
		dispatch( fetchAutomatedTransferStatusOnce( siteId ) );
		dispatch( requestEligibility( siteId ) );
	}, [ siteId, dispatch ] );

	const fetchingTransferStatus = !! useSelector( ( state: AppState ) =>
		isFetchingAutomatedTransferStatus( state, siteId )
	);

	const { eligibilityWarnings }: EligibilityData = useSelector( ( state ) =>
		getEligibility( state, siteId )
	);

	const wordPressSubdomainWarning =
		eligibilityWarnings && eligibilityWarnings.find( ( { id } ) => id === 'wordpress_subdomain' );

	// Check whether it should skip the Wordpress Subdomain warning step
	useEffect( () => {
		if ( ! siteId ) {
			return;
		}

		if ( fetchingTransferStatus ) {
			return;
		}

		if ( wordPressSubdomainWarning ) {
			return;
		}

		goToStep( 'confirm' ); // skip!
	}, [ wordPressSubdomainWarning, fetchingTransferStatus, goToStep, siteId ] );

	const headerTitle = __( 'Your new store' );
	const headerDescription = (
		<>
			{ __( 'This will be your new store domain.' ) }
			<br />
			{ __( 'You can change it later and get a custom one.' ) }
		</>
	);

	function getStepContent() {
		return (
			<div>
				<NextButton disabled={ fetchingTransferStatus } onClick={ () => goToStep( 'confirm' ) }>
					{ __( 'Sounds Good' ) }
				</NextButton>
			</div>
		);
	}

	return (
		<StepWrapper
			flowName="woocommerce-install"
			hideSkip={ true }
			nextLabelText={ __( 'Confirm' ) }
			allowBackFirstStep={ true }
			backUrl="/woocommerce-installation"
			headerText={ headerTitle }
			fallbackHeaderText={ headerTitle }
			subHeaderText={ headerDescription }
			fallbackSubHeaderText={ headerDescription }
			align={ isReskinned ? 'left' : 'center' }
			stepContent={ getStepContent() }
			isWideLayout={ isReskinned }
		/>
	);
}
