import { siteAutomatedTransfersEligibilityQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useHelpCenter } from '../../app/help-center';
import { Notice } from '../../components/notice';
import { DataCenterForm } from './data-center-form';
import { hasBlockingError as getHasBlockingError, ErrorContentInfo } from './error-content-info';
import { WarningContentInfo } from './warning-content-info';

export default function HostingFeatureActivationModal( { siteId }: { siteId: number } ) {
	const { data } = useSuspenseQuery( siteAutomatedTransfersEligibilityQuery( siteId ) );
	const { setShowHelpCenter } = useHelpCenter();
	const [ selectedGeoAffinity, setSelectedGeoAffinity ] = useState( '' );

	if ( ! data ) {
		return null;
	}

	const errors = data.errors;
	const warnings = data.warnings;
	const flattenedWarnings = Object.values( data.warnings ).flat();
	const hasBlockingError = getHasBlockingError( errors );
	const isEligibleAndNoIssues =
		data.is_eligible && errors.length === 0 && flattenedWarnings.length === 0;

	function getContent() {
		if ( isEligibleAndNoIssues ) {
			return <Notice variant="success">{ __( 'This site is eligible to continue.' ) }</Notice>;
		}

		return (
			<>
				{ errors.length > 0 && <ErrorContentInfo errors={ errors } /> }
				{ flattenedWarnings.length > 0 && ! hasBlockingError && (
					<WarningContentInfo warnings={ warnings } />
				) }
			</>
		);
	}

	return (
		<VStack spacing={ 6 }>
			{ getContent() }
			{ data.is_eligible && ! hasBlockingError && (
				<DataCenterForm
					value={ selectedGeoAffinity }
					onChange={ ( value ) => setSelectedGeoAffinity( value ) }
				/>
			) }
			<HStack>
				<Button variant="link" onClick={ () => setShowHelpCenter( true ) }>
					{ __( 'Need help?' ) }
				</Button>
			</HStack>
		</VStack>
	);
}
