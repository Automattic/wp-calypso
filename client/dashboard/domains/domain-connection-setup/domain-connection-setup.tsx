import {
	DomainConnectionSetupMode,
	DomainMappingSetupInfo,
	type DomainConnectionSetupModeValue,
} from '@automattic/api-core';
import {
	Button,
	RadioControl,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody, CardHeader, CardDivider } from '../../components/card';
import SetupStep from './setup-step';

interface DomainConnectionSetupProps {
	domainName: string;
	siteSlug: string;
	domainConnectionSetupInfo: DomainMappingSetupInfo;
	onVerifyConnection: ( mode: DomainConnectionSetupModeValue ) => void;
	isUpdatingConnectionMode: boolean;
}

export default function DomainConnectionSetup( {
	onVerifyConnection,
	isUpdatingConnectionMode,
	domainName,
}: DomainConnectionSetupProps ) {
	const [ connectionMode, setConnectionMode ] = useState< DomainConnectionSetupModeValue >(
		DomainConnectionSetupMode.SUGGESTED
	);
	const [ suggestedStepsCompleted, setSuggestedStepsCompleted ] = useState< boolean[] >( [
		false,
		false,
		false,
	] );
	const [ advancedStepsCompleted, setAdvancedStepsCompleted ] = useState< boolean[] >( [
		false,
		false,
		false,
	] );

	const suggestedModeSteps = [
		{
			title: __( '1. Login to your domain name provider' ),
			label: __( 'I have opened the DNS settings' ),
			content: __( 'Content placeholder' ),
		},
		{
			title: __( '2. Back up DNS records' ),
			label: __( 'I have downloaded the DNS records' ),
			content: __( 'Content placeholder' ),
		},
		{
			title: __( '3. Update DNS records' ),
			label: __( 'I have updated the DNS settings' ),
			content: __( 'Content placeholder' ),
		},
	];

	const advancedModeSteps = [
		{
			title: __( '1. Login to your domain name provider' ),
			label: __( 'I have opened the DNS settings' ),
			content: __( 'Content placeholder' ),
		},
		{
			title: __( '2. Back up DNS records' ),
			label: __( 'I have downloaded the DNS records' ),
			content: __( 'Content placeholder' ),
		},
		{
			title: __( '3. Update name servers' ),
			label: __( 'I have updated the name servers' ),
			content: __( 'Content placeholder' ),
		},
	];

	const handleSuggestedStepChange = ( index: number, checked: boolean ) => {
		setSuggestedStepsCompleted( ( prev ) => {
			const newState = [ ...prev ];
			newState[ index ] = checked;
			return newState;
		} );
	};

	const handleAdvancedStepChange = ( index: number, checked: boolean ) => {
		setAdvancedStepsCompleted( ( prev ) => {
			const newState = [ ...prev ];
			newState[ index ] = checked;
			return newState;
		} );
	};

	return (
		<div className="domain-connection-setup">
			<VStack spacing={ 4 }>
				{ /* Suggested mode */ }
				<Card>
					<CardHeader>
						<HStack spacing={ 2 } justify="flex-start">
							<RadioControl
								selected={ connectionMode }
								options={ [ { label: '', value: DomainConnectionSetupMode.SUGGESTED } ] }
								onChange={ ( value: string ) =>
									setConnectionMode( value as DomainConnectionSetupModeValue )
								}
							/>
							<VStack spacing={ 2 }>
								<Text size="medium" weight={ 500 }>
									{ __( 'I only use this domain name for my website' ) }
								</Text>
								<Text variant="muted">
									{ __( 'You’ll update your name servers to point to WordPress.com' ) }
								</Text>
							</VStack>
						</HStack>
					</CardHeader>
					{ connectionMode === 'suggested' && (
						<CardBody>
							<Text>
								{ sprintf(
									// translators: %s is the domain name
									__(
										'Name servers connect your domain name to your site. It may take up to 72 hours for %s to become visible across the internet. We’ll email you when it’s done.'
									),
									domainName
								) }
							</Text>
							{ suggestedModeSteps.map( ( step, index ) => (
								<>
									<SetupStep
										className="domain-connection-setup__step"
										initiallyExpanded={ false }
										completed={ suggestedStepsCompleted[ index ] }
										onCheckboxChange={ ( checked ) => handleSuggestedStepChange( index, checked ) }
										key={ step.title }
										title={ step.title }
										label={ step.label }
									>
										<Text>{ step.content }</Text>
									</SetupStep>
									{ index < suggestedModeSteps.length - 1 && <CardDivider /> }
								</>
							) ) }
							<ButtonStack justify="flex-start">
								<Button
									variant="primary"
									onClick={ () => onVerifyConnection( DomainConnectionSetupMode.SUGGESTED ) }
									isBusy={ isUpdatingConnectionMode }
								>
									{ __( 'Verify Connection' ) }
								</Button>
							</ButtonStack>
						</CardBody>
					) }
				</Card>

				{ /* Advanced mode */ }
				<Card>
					<CardHeader>
						<HStack spacing={ 2 } justify="flex-start">
							<RadioControl
								selected={ connectionMode }
								options={ [ { label: '', value: DomainConnectionSetupMode.ADVANCED } ] }
								onChange={ ( value: string ) =>
									setConnectionMode( value as DomainConnectionSetupModeValue )
								}
							/>
							<VStack spacing={ 2 }>
								<Text size="medium" weight={ 500 }>
									{ __( 'I use this domain name for email or other services' ) }
								</Text>
								<Text variant="muted">{ __( 'You’ll update DNS records (CNAME and A)' ) }</Text>
							</VStack>
						</HStack>
					</CardHeader>
					{ connectionMode === 'advanced' && (
						<CardBody>
							<Text>
								{ sprintf(
									// translators: %s is the domain name
									__(
										'DNS records point your domain name to your site. It may take up to 72 hours for %s to become visible across the internet. We’ll email you when it’s done.'
									),
									domainName
								) }
							</Text>
							{ advancedModeSteps.map( ( step, index ) => (
								<>
									<SetupStep
										className="domain-connection-setup__step"
										initiallyExpanded={ false }
										completed={ advancedStepsCompleted[ index ] }
										onCheckboxChange={ ( checked ) => handleAdvancedStepChange( index, checked ) }
										key={ step.title }
										title={ step.title }
										label={ step.label }
									>
										<Text>{ step.content }</Text>
									</SetupStep>
									{ index < advancedModeSteps.length - 1 && <CardDivider /> }
								</>
							) ) }
							<ButtonStack justify="flex-start">
								<Button
									variant="primary"
									onClick={ () => onVerifyConnection( DomainConnectionSetupMode.SUGGESTED ) }
									isBusy={ isUpdatingConnectionMode }
								>
									{ __( 'Verify Connection' ) }
								</Button>
							</ButtonStack>
						</CardBody>
					) }
				</Card>
			</VStack>
		</div>
	);
}
