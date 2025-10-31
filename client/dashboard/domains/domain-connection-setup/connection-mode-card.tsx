import { type DomainConnectionSetupModeValue } from '@automattic/api-core';
import {
	Button,
	RadioControl,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody, CardHeader, CardDivider } from '../../components/card';
import SetupStep from './setup-step';

interface ConnectionModeStep {
	title: string;
	label: string;
	content: string;
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
}: ConnectionModeCardProps ) {
	const isSelected = selectedMode === mode;

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
					<Text>{ infoText }</Text>
					{ steps.map( ( step, index ) => (
						<>
							<SetupStep
								className="domain-connection-setup__step"
								initiallyExpanded={ false }
								completed={ stepsCompleted[ index ] }
								onCheckboxChange={ ( checked ) => onStepChange( index, checked ) }
								key={ step.title }
								title={ step.title }
								label={ step.label }
							>
								<Text>{ step.content }</Text>
							</SetupStep>
							{ index < steps.length - 1 && <CardDivider /> }
						</>
					) ) }
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
