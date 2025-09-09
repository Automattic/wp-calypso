import {
	type DomainConnectionSetupModeValue,
	DomainConnectionSetupMode,
} from '@automattic/api-core';
import {
	__experimentalHStack as HStack,
	Button,
	Icon,
	__experimentalText as Text,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { pages } from '@wordpress/icons';
import { StepName, StepType, type StepNameValue, type StepTypeValue } from '../types';

type SwitchSetupProps = {
	currentStepType: StepTypeValue;
	currentMode: DomainConnectionSetupModeValue;
	supportsDomainConnect: boolean;
	isSubdomain: boolean;
	setPage: ( stepName: StepNameValue ) => void;
};

export default function SwitchSetup( {
	currentStepType,
	currentMode,
	supportsDomainConnect,
	isSubdomain,
	setPage,
}: SwitchSetupProps ) {
	if ( currentStepType === StepType.CONNECTED || currentStepType === StepType.VERIFYING ) {
		return null;
	}

	const switchToAdvancedSetup = () =>
		setPage( isSubdomain ? StepName.SUBDOMAIN_ADVANCED_START : StepName.ADVANCED_START );
	const switchToSuggestedSetup = () =>
		setPage( isSubdomain ? StepName.SUBDOMAIN_SUGGESTED_START : StepName.SUGGESTED_START );
	const switchToDomainConnectSetup = () => setPage( StepName.DC_START );

	const getMessage = () => {
		// Domain Connect does not support subdomains so we don't need to check for that
		if ( supportsDomainConnect ) {
			if ( currentMode === DomainConnectionSetupMode.DC ) {
				return __( 'Switch to our <asug>manual setup</asug> or <aadv>advanced setup</aadv>.' );
			} else if ( currentMode === DomainConnectionSetupMode.SUGGESTED ) {
				return __( 'Switch to our <adc>simple setup</adc> or <aadv>advanced setup</aadv>.' );
			}
			return __( 'Switch to our <adc>simple setup</adc> or <asug>manual setup</asug>.' );
		}
		if ( currentMode === DomainConnectionSetupMode.SUGGESTED && isSubdomain ) {
			return __(
				'Can’t set NS records for your subdomain? Switch to our <aadv>advanced setup</aadv>.'
			);
		} else if ( currentMode === DomainConnectionSetupMode.ADVANCED ) {
			return __( 'Switch to our <asug>suggested setup</asug>.' );
		}
		return __( 'Switch to our <aadv>advanced setup</aadv>.' );
	};

	return (
		<HStack justify="flex-start">
			<Icon icon={ pages } size={ 16 } />
			<Text variant="muted">
				{ createInterpolateElement( getMessage(), {
					asug: <Button variant="link" onClick={ switchToSuggestedSetup } />,
					aadv: <Button variant="link" onClick={ switchToAdvancedSetup } />,
					adc: <Button variant="link" onClick={ switchToDomainConnectSetup } />,
				} ) }
			</Text>
		</HStack>
	);
}
