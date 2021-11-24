import { BackButton, NextButton } from '@automattic/onboarding';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { ReactElement, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import yourNewStoreImage from 'calypso/assets/images/woocommerce-install/your-new-store.png';
import { default as HoldList } from 'calypso/blocks/eligibility-warnings/hold-list';
import WarningList from 'calypso/blocks/eligibility-warnings/warning-list';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
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
import type { WooCommerceInstallProps } from '../';
import type { GoToStep } from '../../../types';

import './style.scss';

function StepPicture( {
	isLoading,
	goToStep,
}: {
	isLoading: boolean;
	goToStep: GoToStep;
} ): ReactElement {
	return (
		<div className="confirm__image-container">
			{ isLoading && <LoadingEllipsis /> }
			<img src={ yourNewStoreImage } alt="" />
			<div>
				<BackButton onClick={ () => goToStep( 'select-site' ) } />
			</div>
		</div>
	);
}

export default function Confirm( props: WooCommerceInstallProps ): ReactElement | null {
	const { siteId, goToStep, isReskinned, stepSectionName, headerTitle, headerDescription } = props;
	const { __ } = useI18n();
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
	const {
		eligibilityHolds,
		eligibilityWarnings: allEligibilityWarnings,
	}: EligibilityData = useSelector( ( state ) => getEligibility( state, siteId ) );

	// Check whether the wpcom.com subdomain warning is present.
	const wordPressSubdomainWarning = allEligibilityWarnings?.find(
		( { id } ) => id === 'wordpress_subdomain'
	);

	const eligibilityWarnings = allEligibilityWarnings?.filter(
		( { id } ) => id !== 'wordpress_subdomain'
	);

	// Pick the wpcom subdomain.
	const wpcomDomain = useSelector( ( state ) => getSiteDomain( state, siteId ) );

	const isLoading = ! siteId || isFetchingTransferStatus;

	function getWPComSubdomainWarningContent() {
		// Get staging sudomain based on the wpcom subdomain.
		const stagingDomain = wpcomDomain?.replace( /\b.wordpress.com/, '.wpcomstaging.com' );

		return (
			<>
				<StepPicture isLoading={ isLoading } goToStep={ goToStep } />

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
			wordPressSubdomainWarning &&
			( stepSectionName === 'wpcom_subdomain_substep' || typeof stepSectionName === 'undefined' )
		) {
			return getWPComSubdomainWarningContent();
		}

		return (
			<>
				<StepPicture isLoading={ isLoading } goToStep={ goToStep } />

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
