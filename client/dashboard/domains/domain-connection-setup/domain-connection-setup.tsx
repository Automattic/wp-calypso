import {
	DomainConnectionSetupMode,
	DomainMappingSetupInfo,
	type DomainConnectionSetupModeValue,
	DomainMappingStatus,
} from '@automattic/api-core';
import {
	__experimentalVStack as VStack,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	Button,
	Icon,
	ExternalLink,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { globe } from '@wordpress/icons';
import { useState } from 'react';
import { Card, CardBody } from '../../components/card';
import InlineSupportLink from '../../components/inline-support-link';
import ConnectionModeCard from './connection-mode-card';
import DNSRecordsDataView from './dns-records-dataview';
import DomainConnectCard from './domain-connect-card';
import DomainRegistrarBanner from './domain-registrar-banner';

interface DomainConnectionSetupProps {
	domainName: string;
	siteSlug: string;
	domainConnectionSetupInfo: DomainMappingSetupInfo;
	onVerifyConnection: ( mode: DomainConnectionSetupModeValue ) => void;
	isUpdatingConnectionMode: boolean;
	domainMappingStatus: DomainMappingStatus;
	queryError?: string | null;
	queryErrorDescription?: string | null;
}

export default function DomainConnectionSetup( {
	onVerifyConnection,
	isUpdatingConnectionMode,
	domainMappingStatus,
	domainName,
	domainConnectionSetupInfo,
	queryError,
	queryErrorDescription,
}: DomainConnectionSetupProps ) {
	const domainConnectAvailable =
		domainConnectionSetupInfo.domain_connect_apply_wpcom_hosting !== null;
	const recommendedMode = domainMappingStatus.has_mx_records
		? DomainConnectionSetupMode.ADVANCED
		: DomainConnectionSetupMode.SUGGESTED;

	const [ connectionMode, setConnectionMode ] = useState< DomainConnectionSetupModeValue >(
		domainConnectAvailable ? DomainConnectionSetupMode.DC : recommendedMode
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

	const isReseller = !! domainConnectionSetupInfo.reseller;
	const registrar = domainConnectionSetupInfo.reseller || domainConnectionSetupInfo.registrar;
	const registrar_url = domainConnectionSetupInfo.registrar_url;

	const loginStepTitle = registrar
		? sprintf(
				// translators: %s is the registrar name
				__( 'Log in to %s' ),
				registrar
		  )
		: __( 'Log in to your domain provider' );

	const suggestedLoginStep = {
		title: loginStepTitle,
		label: __( 'I have opened the name server settings' ),
		content: (
			<Text>
				{ createInterpolateElement(
					// translators: <domain/> is the domain name and <guide/> is a support link
					__(
						'Open the name server settings for <domain/>. Some registrars call this DNS settings. Need help? <guide>Follow our guide.</guide>'
					),
					{
						domain: <>{ domainName }</>,
						guide: <InlineSupportLink supportContext="map-domain-setup-instructions" />,
					}
				) }
			</Text>
		),
	};

	const suggestedModeSteps = [
		suggestedLoginStep,
		{
			title: __( 'Save your current name servers' ),
			label: __( 'I have saved a copy of my name servers' ),
			content: (
				<Text>
					{ __(
						'Before making changes, save a copy of your current name servers. You can take a screenshot, copy them into a document, or write them down.'
					) }
				</Text>
			),
		},
		{
			title: __( 'Update name servers' ),
			label: __( 'I have updated the name servers' ),
			content: (
				<VStack spacing={ 6 }>
					<Text>
						{ __( 'Replace your current name servers with the WordPress.com name servers below.' ) }
					</Text>
					<DNSRecordsDataView
						domainName={ domainName }
						domainMappingStatus={ domainMappingStatus }
						domainConnectionSetupInfo={ domainConnectionSetupInfo }
						mode={ DomainConnectionSetupMode.SUGGESTED }
					/>
				</VStack>
			),
		},
	];

	const advancedLoginStep = {
		title: loginStepTitle,
		label: __( 'I have opened the DNS settings' ),
		content: (
			<Text>
				{ createInterpolateElement(
					// translators: <registrar/> is the domain provider and <domain/> is the domain name
					__( 'Log in to <registrar/> and open DNS management for <domain/>.' ),
					{
						registrar:
							! isReseller && registrar_url ? (
								<ExternalLink href={ registrar_url }>{ registrar }</ExternalLink>
							) : (
								<>{ registrar || __( 'your domain provider' ) }</>
							),
						domain: <>{ domainName }</>,
					}
				) }
			</Text>
		),
	};

	const advancedModeSteps = [
		advancedLoginStep,
		{
			title: __( 'Back up DNS records' ),
			label: __( 'I have downloaded the DNS records' ),
			content: (
				<Text>
					{ __(
						'It’s rare, but things can go sideways. Download your DNS records as a fallback, just in case.'
					) }
				</Text>
			),
		},
		{
			title: __( 'Update DNS records' ),
			label: __( 'I have updated the DNS settings' ),
			content: (
				<VStack spacing={ 6 }>
					<Text>
						{ __(
							'Replace all A and CNAME records with the values below. You can leave other records (like MX) as they are.'
						) }
					</Text>
					<DNSRecordsDataView
						domainName={ domainName }
						domainMappingStatus={ domainMappingStatus }
						domainConnectionSetupInfo={ domainConnectionSetupInfo }
						mode={ DomainConnectionSetupMode.ADVANCED }
					/>
				</VStack>
			),
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

	if (
		connectionMode === DomainConnectionSetupMode.DC &&
		domainConnectionSetupInfo.domain_connect_apply_wpcom_hosting !== null
	) {
		return (
			<div className="domain-connection-setup">
				<VStack spacing={ 6 }>
					<DomainRegistrarBanner
						domainName={ domainName }
						registrar={ registrar }
						registrar_url={ registrar_url }
						isReseller={ isReseller }
					/>
					<DomainConnectCard
						onChangeSetupMode={ () => setConnectionMode( recommendedMode ) }
						onVerifyConnection={ () => onVerifyConnection( DomainConnectionSetupMode.DC ) }
						isUpdatingConnectionMode={ isUpdatingConnectionMode }
						registrar={ registrar }
						registrar_url={ isReseller ? null : registrar_url }
						error={ queryError }
						errorDescription={ queryErrorDescription }
					/>
				</VStack>
			</div>
		);
	}

	return (
		<div className="domain-connection-setup">
			<VStack spacing={ 6 }>
				<DomainRegistrarBanner
					domainName={ domainName }
					registrar={ registrar }
					registrar_url={ registrar_url }
					isReseller={ isReseller }
				/>
				<VStack spacing={ 4 }>
					{ domainConnectionSetupInfo.domain_connect_apply_wpcom_hosting !== null && (
						<Card>
							<CardBody>
								<HStack spacing={ 2 } justify="flex-start">
									<Icon icon={ globe } />
									<Text>{ __( 'This domain name can be automatically connected.' ) }</Text>
									<Button
										variant="link"
										onClick={ () => setConnectionMode( DomainConnectionSetupMode.DC ) }
									>
										{ __( 'Use Domain Connect' ) }
									</Button>
								</HStack>
							</CardBody>
						</Card>
					) }
					<ConnectionModeCard
						mode={ DomainConnectionSetupMode.SUGGESTED }
						title={ __( 'I only use this domain for my website' ) }
						description={ __( 'You’ll update name servers' ) }
						heading={ __( 'Connect with name servers' ) }
						infoText={ sprintf(
							// translators: %s is the domain name
							__(
								'Name servers connect your domain to your website. After verification starts, %s can take up to 72 hours to appear across the internet.'
							),
							domainName
						) }
						steps={ suggestedModeSteps }
						stepsCompleted={ suggestedStepsCompleted }
						selectedMode={ connectionMode }
						onModeChange={ setConnectionMode }
						onStepChange={ handleSuggestedStepChange }
						onVerifyConnection={ () => onVerifyConnection( DomainConnectionSetupMode.SUGGESTED ) }
						isUpdatingConnectionMode={ isUpdatingConnectionMode }
						verificationDisabled={ ! suggestedStepsCompleted.every( ( completed ) => completed ) }
						hasEmailOrOtherServices={ domainMappingStatus.has_mx_records }
					/>

					<ConnectionModeCard
						mode={ DomainConnectionSetupMode.ADVANCED }
						title={ __( 'I use this domain for my website, email, or other services' ) }
						description={ __( 'You’ll update DNS records' ) }
						infoText={ sprintf(
							// translators: %s is the domain name
							__(
								'DNS records point your domain name to your site. It may take up to 72 hours for %s to become visible across the internet. We’ll email you when it’s done.'
							),
							domainName
						) }
						steps={ advancedModeSteps }
						stepsCompleted={ advancedStepsCompleted }
						selectedMode={ connectionMode }
						onModeChange={ setConnectionMode }
						onStepChange={ handleAdvancedStepChange }
						onVerifyConnection={ () => onVerifyConnection( DomainConnectionSetupMode.ADVANCED ) }
						isUpdatingConnectionMode={ isUpdatingConnectionMode }
						verificationDisabled={ ! advancedStepsCompleted.every( ( completed ) => completed ) }
						hasEmailOrOtherServices={ domainMappingStatus.has_mx_records }
					/>
				</VStack>
			</VStack>
		</div>
	);
}
