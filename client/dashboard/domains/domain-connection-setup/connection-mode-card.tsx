import {
	DomainConnectionSetupMode,
	type DomainConnectionSetupModeValue,
} from '@automattic/api-core';
import {
	Button,
	RadioControl,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody, CardHeader, CardDivider } from '../../components/card';
import Notice from '../../components/notice';
import SetupStep from './setup-step';

interface ConnectionModeStep {
	title: string;
	label: string;
	content: React.ReactNode;
}

interface ConnectionModeCardProps {
	mode: DomainConnectionSetupModeValue;
	title: string;
	description: string;
	infoText: string;
	steps: ConnectionModeStep[];
	stepsCompleted: boolean[];
	selectedMode: DomainConnectionSetupModeValue;
	onModeChange: ( mode: DomainConnectionSetupModeValue ) => void;
	onStepChange: ( index: number, checked: boolean ) => void;
	onVerifyConnection: () => void;
	isUpdatingConnectionMode: boolean;
	verificationDisabled: boolean;
	hasEmailOrOtherServices: boolean;
}

export default function ConnectionModeCard( {
	mode,
	title,
	description,
	infoText,
	steps,
	stepsCompleted,
	selectedMode,
	onModeChange,
	onStepChange,
	onVerifyConnection,
	isUpdatingConnectionMode,
	verificationDisabled,
	hasEmailOrOtherServices,
}: ConnectionModeCardProps ) {
	const isSelected = selectedMode === mode;

	// Track which steps are expanded (first step expanded by default)
	const [ stepsExpanded, setStepsExpanded ] = useState< boolean[] >(
		steps.map( ( _, index ) => index === 0 )
	);

	const handleStepChange = ( index: number, checked: boolean ) => {
		onStepChange( index, checked );

		// When a step is checked, collapse all steps and expand the next one
		if ( checked ) {
			const newStepsExpanded = steps.map( () => false );

			// If not the last step, expand the next one
			if ( index < steps.length - 1 ) {
				newStepsExpanded[ index + 1 ] = true;
			} else {
				// If it's the last step, keep it expanded
				newStepsExpanded[ index ] = true;
			}

			setStepsExpanded( newStepsExpanded );
		}
	};

	const handleStepToggle = ( index: number, expanded: boolean ) => {
		setStepsExpanded( ( prev ) => {
			const newState = [ ...prev ];
			newState[ index ] = expanded;
			return newState;
		} );
	};

	return (
		<Card>
			<CardHeader>
				<HStack spacing={ 2 } justify="flex-start">
					<RadioControl
						selected={ selectedMode }
						options={ [ { label: '', value: mode } ] }
						onChange={ ( value: string ) =>
							onModeChange( value as DomainConnectionSetupModeValue )
						}
					/>
					<VStack spacing={ 2 }>
						<Text size="medium" weight={ 500 }>
							{ title }
						</Text>
						<Text variant="muted">{ description }</Text>
					</VStack>
				</HStack>
			</CardHeader>
			{ isSelected && (
				<CardBody>
					<VStack spacing={ 4 }>
						<VStack spacing={ 6 }>
							{ mode === DomainConnectionSetupMode.SUGGESTED && ! hasEmailOrOtherServices && (
								<Notice variant="info" title="No email or other services detected">
									<Text>
										{ __( 'You can safely connect your domain without affecting anything else.' ) }
									</Text>
								</Notice>
							) }
							{ mode === DomainConnectionSetupMode.SUGGESTED && hasEmailOrOtherServices && (
								<Notice variant="warning" title="Email or other services detected">
									<Text>
										{ __(
											'Warning: the services attached to your domain might be interrupted if you use this connection method'
										) }
									</Text>
								</Notice>
							) }
							{ mode === DomainConnectionSetupMode.ADVANCED && hasEmailOrOtherServices && (
								<Notice variant="info" title="Email or other services detected">
									<Text>
										{ __(
											'To avoid disruption, this is the safest way to connect your domain name.'
										) }
									</Text>
								</Notice>
							) }
							<Text>{ infoText }</Text>
						</VStack>
						<div>
							{ steps.map( ( step, index ) => (
								<div key={ step.title }>
									<SetupStep
										className="domain-connection-setup__step"
										expanded={ stepsExpanded[ index ] }
										completed={ stepsCompleted[ index ] }
										onCheckboxChange={ ( checked ) => handleStepChange( index, checked ) }
										onToggle={ ( expanded ) => handleStepToggle( index, expanded ) }
										title={ step.title }
										label={ step.label }
									>
										{ step.content }
									</SetupStep>
									{ index < steps.length - 1 && <CardDivider /> }
								</div>
							) ) }
						</div>
					</VStack>
					<ButtonStack justify="flex-start">
						<Button
							variant="primary"
							onClick={ onVerifyConnection }
							isBusy={ isUpdatingConnectionMode }
							disabled={ verificationDisabled }
						>
							{ __( 'Verify Connection' ) }
						</Button>
					</ButtonStack>
				</CardBody>
			) }
		</Card>
	);
}
