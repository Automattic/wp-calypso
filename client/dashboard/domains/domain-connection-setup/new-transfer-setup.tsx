import { domainQuery, domainConnectionSetupInfoQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
	ExternalLink,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import { domainTransferSetupRoute } from '../../app/router/domains';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody, CardDivider } from '../../components/card';
import InlineSupportLink from '../../components/inline-support-link';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import SetupStep from './setup-step';

export default function DomainTransferSetup() {
	const { domainName } = domainTransferSetupRoute.useParams();

	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	const { data: domainConnectionSetupInfo } = useSuspenseQuery(
		domainConnectionSetupInfoQuery( domainName, domain.blog_id )
	);

	const registrar = domainConnectionSetupInfo?.registrar || null;
	const registrar_url = domainConnectionSetupInfo?.registrar_url || null;
	const isReseller = !! domainConnectionSetupInfo?.reseller;

	const [ stepsCompleted, setStepsCompleted ] = useState< boolean[] >( [ false, false ] );
	const [ stepsExpanded, setStepsExpanded ] = useState< boolean[] >( [ false, false ] );

	const steps = [
		{
			title: sprintf(
				// translators: %s is a domain name
				__( '1. Unlock %s' ),
				domainName
			),
			label: sprintf(
				// translators: %s is a domain name
				__( 'I have unlocked %s' ),
				domainName
			),
			content: (
				<Text>
					{ createInterpolateElement(
						// translators: <registrar/> is the domain name provider, <domain/> is the domain name
						__(
							'Log in to <registrar/> and open DNS management for <domain/>. Go to Transfer, then switch off Domain Lock. Need help? <link>Follow our guide</link>'
						),

						{
							registrar:
								! isReseller && registrar_url ? (
									<ExternalLink href={ registrar_url }> { registrar } </ExternalLink>
								) : (
									<>{ registrar || __( 'your domain name provider' ) }</>
								),
							domain: <>{ domainName }</>,
							link: <InlineSupportLink supportContext="transfer-domain-registrar-login" />,
						}
					) }
				</Text>
			),
		},
		{
			title: __( '2. Enter authorization code' ),
			content: (
				<VStack spacing={ 6 }>
					<Text>
						{ __(
							'Once domain is unlocked, enter your unique authorization code below. It may also be called a transfer key, auth code, or EPP.'
						) }
					</Text>
				</VStack>
			),
		},
	];

	const onStepChange = ( index: number, checked: boolean ) => {
		setStepsCompleted( ( prev ) => {
			const newState = [ ...prev ];
			newState[ index ] = checked;
			return newState;
		} );
	};

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

	const renderDomainBanner = () => {
		return (
			<Card>
				<CardBody>
					<HStack spacing={ 2 } justify="space-between">
						<Text size="medium" style={ { whiteSpace: 'nowrap' } }>
							{ domainName }
						</Text>
						{ registrar && (
							<HStack spacing={ 1 } justify="flex-end">
								<Text variant="muted" size="small">
									{ __( 'Registered by' ) }
								</Text>
								{ ! isReseller && registrar_url ? (
									<ExternalLink href={ registrar_url }>{ registrar }</ExternalLink>
								) : (
									<Text size="small">{ registrar }</Text>
								) }
							</HStack>
						) }
					</HStack>
				</CardBody>
			</Card>
		);
	};

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ __( 'Transfer your domain name' ) }
					description={ __( 'Start your transfer in minutes. We’ll guide you through each step.' ) }
				/>
			}
		>
			{ renderDomainBanner() }
			<VStack spacing={ 6 }>
				<Card>
					<CardBody>
						<VStack spacing={ 6 }>
							<Text size="medium" weight={ 500 }>
								{ sprintf(
									// translators: %s is a domain name
									__( 'Transferring %s' ),
									domainName
								) }
							</Text>
							<Text>
								{ __(
									'Domain name transfers typically take 5–7 days. If you want to use it quicker, connect your domain name first, then initiate the transfer from GoDaddy later.'
								) }
							</Text>
						</VStack>
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

						<ButtonStack justify="flex-start">
							<Button variant="primary" onClick={ () => {} } isBusy={ false } disabled={ false }>
								{ __( 'Transfer domain' ) }
							</Button>
						</ButtonStack>

						<Text size="medium" weight={ 500 }>
							{ __( 'Need help?' ) }
						</Text>
						<VStack spacing={ 2 }>
							<InlineSupportLink supportContext="transfer-domain-registration">
								{ __( 'Domain name transfer guide' ) }
							</InlineSupportLink>
							<InlineSupportLink supportContext="general-support-options">
								{ __( 'Contact support' ) }
							</InlineSupportLink>
						</VStack>
					</CardBody>
				</Card>
			</VStack>
		</PageLayout>
	);
}
