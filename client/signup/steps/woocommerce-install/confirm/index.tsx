import { BackButton, NextButton } from '@automattic/onboarding';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { ReactElement, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { default as HoldList } from 'calypso/blocks/eligibility-warnings/hold-list';
import WarningList from 'calypso/blocks/eligibility-warnings/warning-list';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import StepWrapper from 'calypso/signup/step-wrapper';
import DomainEligibilityWarning from 'calypso/components/eligibility-warnings/domain-warning';
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
import type { WooCommerceInstallProps } from '../';

import './style.scss';

export default function Confirm( props: WooCommerceInstallProps ): ReactElement | null {
	const { goToStep, isReskinned, stepSectionName, headerTitle, headerDescription } = props;
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
	}, [ siteId, dispatch, goToStep ] );

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

	const isProcessing = ! siteId || isFetchingTransferStatus || ! wordPressSubdomainWarning;

	function getWPComSubdomainWarningContent() {
		// Get sitename from the wpcom domain.
		const sitename = wpcomDomain?.replace( /\b.wordpress.com/, '' );

		return (
			<DomainEligibilityWarning sitename={sitename} />
		);
	}

	function getOtherElegibiliytContent() {
		return (
			<>
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
			</>
		);
	}

	function getContent() {
		return(
			<div className="confirm__instructions-container">
			{isProcessing && <LoadingEllipsis />}
			{ wordPressSubdomainWarning && getWPComSubdomainWarningContent() }
			{ getOtherElegibiliytContent() }
			<p>
						{ createInterpolateElement( __( '<a>Contact support</a> for help and questions.' ), {
							a: <a href="#support-link" />,
						} ) }
					</p>
			<NextButton onClick={ () => goToStep( 'transfer' ) }>{ __( 'Confirm' ) }</NextButton>
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
			stepContent={ getContent() }
			isWideLayout={ isReskinned }
			{ ...props }
		/>
	);
}
