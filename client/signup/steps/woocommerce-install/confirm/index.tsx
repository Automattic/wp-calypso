import { CompactCard } from '@automattic/components';
import { BackButton, NextButton, SubTitle, Title } from '@automattic/onboarding';
import { Spinner } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { ReactElement, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import yourNewStoreImage from 'calypso/assets/images/woocommerce-install/your-new-store.png';
import { default as HoldList } from 'calypso/blocks/eligibility-warnings/hold-list';
import WarningList from 'calypso/blocks/eligibility-warnings/warning-list';
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
import type { GoToStep } from '../../../types';
import type { AppState } from 'calypso/types';

import './style.scss';

interface Props {
	goToStep: GoToStep;
	submitSignupStep: ( step: string, data: unknown ) => void;
	isReskinned: boolean;
}

export default function Confirm( { goToStep, isReskinned }: Props ): ReactElement | null {
	const { __ } = useI18n();
	const siteId = useSelector( getSelectedSiteId ) as number;
	const dispatch = useDispatch();

	// Request eligibility data.
	useEffect( () => {
		if ( ! siteId ) {
			return;
		}
		dispatch( fetchAutomatedTransferStatusOnce( siteId ) );
		dispatch( requestEligibility( siteId ) );
	}, [ siteId, dispatch ] );

	// Check whether it's requesting eligibility data.
	const isFetchingTransferStatus = !! useSelector( ( state ) =>
		isFetchingAutomatedTransferStatus( state, siteId )
	);

	// Get eligibility data.
	const { eligibilityHolds, eligibilityWarnings }: EligibilityData = useSelector( ( state ) =>
		getEligibility( state, siteId )
	);

	// Check whether the wpcom.com subdomain warning is present.
	const wordPressSubdomainWarning =
		eligibilityWarnings && eligibilityWarnings.find( ( { id } ) => id === 'wordpress_subdomain' );

	// Pick the wpcom subdomain.
	const wpcomDomain = useSelector( ( state: AppState ) => getSiteDomain( state, siteId ) );

	function getWPComSubdomainWarningContent() {
		const isProcessing = ! siteId || isFetchingTransferStatus || ! wordPressSubdomainWarning;

		// Get staging sudomain based on the wpcom subdomain.
		const stagingDomain = wpcomDomain?.replace( /\b.wordpress.com/, '.wpcomstaging.com' );

		return (
			<>
				<div className="confirm__image-container">
					<img src={ yourNewStoreImage } alt="" />
				</div>
				<div className="confirm__instructions-container">
					<div className="confirm__instructions-wpcom-domain">{ wpcomDomain }</div>
					<div className="confirm__instructions-staging-domain">{ stagingDomain }</div>

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

					<NextButton disabled={ isProcessing } onClick={ () => goToStep( 'confirm' ) }>
						{ __( 'Sounds good' ) }
					</NextButton>
				</div>
			</>
		);
	}

	function getContent() {
		if ( wordPressSubdomainWarning ) {
			return getWPComSubdomainWarningContent();
		}

		return (
			<>
				<div className="confirm__heading-wrapper">
					<div className="confirm__heading">
						<Title>{ __( 'Add WooCommerce to your site' ) }</Title>
						<SubTitle></SubTitle>

						<div className="confirm__buttons-group">
							<div>
								<BackButton onClick={ () => goToStep( 'confirm' ) } />
							</div>
						</div>
					</div>
				</div>
				<div className="confirm__content">
					{ isFetchingTransferStatus && <Spinner /> }
					{ !! eligibilityHolds?.length && (
						<CompactCard>
							<HoldList holds={ eligibilityHolds } context={ 'plugins' } isPlaceholder={ false } />
						</CompactCard>
					) }
					{ !! eligibilityWarnings?.length && (
						<CompactCard>
							<WarningList warnings={ eligibilityWarnings } context={ 'plugins' } />
						</CompactCard>
					) }
					<div>
						<NextButton onClick={ () => goToStep( 'transfer' ) }>{ __( 'Confirm' ) }</NextButton>
					</div>
				</div>
			</>
		);
	}

	const headerTitle = __( 'Your new store' );
	const headerDescription = (
		<>
			{ __( 'This will be your new store domain.' ) }
			<br />
			{ __( 'You can change it later and get a custom one.' ) }
		</>
	);

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
			stepContent={ getContent() }
			isWideLayout={ isReskinned }
		/>
	);
}
