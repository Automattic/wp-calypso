import { siteAutomatedTransfersEligibilityQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useHelpCenter } from '../../app/help-center';
import { ButtonStack } from '../../components/button-stack';
import ComponentViewTracker from '../../components/component-view-tracker';
import { Notice } from '../../components/notice';
import { DataCenterForm } from './data-center-form';
import {
	hasAnyBlockingError as getHasAnyBlockingError,
	hasHoldingError as getHasHoldingError,
	EligibilityErrors,
	ErrorContentInfo,
} from './error-content-info';
import { WarningContentInfo } from './warning-content-info';

export default function HostingFeatureActivationModal( {
	siteId,
	onProceed,
}: {
	siteId: number;
	onProceed: ( options: { geo_affinity?: string } ) => void;
} ) {
	const { recordTracksEvent } = useAnalytics();
	const { data } = useSuspenseQuery( siteAutomatedTransfersEligibilityQuery( siteId ) );
	const { setShowHelpCenter } = useHelpCenter();
	const [ selectedGeoAffinity, setSelectedGeoAffinity ] = useState( '' );

	if ( ! data ) {
		return null;
	}

	const errors = data.errors;
	const warnings = data.warnings;
	const isEligible = data.is_eligible;
	const needsPlanUpgrade = getHasHoldingError( errors, EligibilityErrors.NO_BUSINESS_PLAN );
	const hasAnyBlockingError = getHasAnyBlockingError( errors );

	function getContent() {
		const flattenedWarnings = Object.values( warnings ).flat();
		if ( isEligible && errors.length === 0 && flattenedWarnings.length === 0 ) {
			return <Notice variant="success">{ __( 'This site is eligible to continue.' ) }</Notice>;
		}

		return (
			<>
				{ errors.length > 0 && <ErrorContentInfo errors={ errors } /> }
				{ flattenedWarnings.length > 0 && ! hasAnyBlockingError && (
					<WarningContentInfo warnings={ warnings } />
				) }
			</>
		);
	}

	function handleClick() {
		onProceed( { geo_affinity: selectedGeoAffinity } );
	}

	return (
		<>
			<ComponentViewTracker eventName="calypso_dashboard_hosting_feature_activation_modal_impression" />
			<VStack spacing={ 6 }>
				{ getContent() }
				{ isEligible && ! hasAnyBlockingError && (
					<DataCenterForm
						value={ selectedGeoAffinity }
						onChange={ ( value ) => setSelectedGeoAffinity( value ) }
					/>
				) }
				<ButtonStack justify="space-between">
					<Button
						variant="link"
						onClick={ () => {
							setShowHelpCenter( true );
							recordTracksEvent(
								'calypso_dashboard_hosting_feature_activation_modal_help_center_click'
							);
						} }
					>
						{ __( 'Need help?' ) }
					</Button>
					<Button
						__next40pxDefaultSize
						variant="primary"
						disabled={ ! isEligible && ! needsPlanUpgrade }
						onClick={ handleClick }
					>
						{ needsPlanUpgrade ? __( 'Upgrade and continue' ) : __( 'Activate hosting features' ) }
					</Button>
				</ButtonStack>
			</VStack>
		</>
	);
}
