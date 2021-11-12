import { NextButton } from '@automattic/onboarding';
import { Spinner } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { ReactElement, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import yourNewStoreImage from 'calypso/assets/images/woocommerce-install/your-new-store.png';
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
import { getSiteDomain } from 'calypso/state/sites/selectors';
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

	const wpcomDomain = useSelector( ( state: AppState ) => getSiteDomain( state, siteId ) );
	const stagindDomaon = wpcomDomain?.replace( /\b.wordpress.com/, '.wpcomstaging.com' );

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

	const isProcessing = ! siteId || fetchingTransferStatus || ! wordPressSubdomainWarning;

	function getStepContent() {
		return (
			<>
				<div className="woocommerce-install-confirm-wordpress-subdomain__image-container">
					<img src={ yourNewStoreImage } alt="" />
				</div>
				<div className="woocommerce-install-confirm-wordpress-subdomain__instructions-container">
					<div className="woocommerce-install-confirm-wordpress-subdomain__instructions-wpcom-domain">
						{ wpcomDomain }
					</div>
					<div className="woocommerce-install-confirm-wordpress-subdomain__instructions-staging-domain">
						{ stagindDomaon }
					</div>

					<p>
						{ __(
							'By installing this product your subdomain will change. You can change it later to a custom domain and we will pick up the tap for a year.'
						) }
					</p>

					<p>
						{ createInterpolateElement( __( '<a>Contact support</a> for help and questions.' ), {
							a: <a href="#support-link" />,
						} ) }
						{ __( 'Contact support for help and questions.' ) }
					</p>

					<NextButton disabled={ isProcessing } onClick={ () => goToStep( 'confirm' ) }>
						{ __( 'Sounds good' ) }
					</NextButton>
				</div>
			</>
		);
	}

	if ( isProcessing ) {
		return <Spinner />;
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
