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

	const commonSteps = [
		{
			title: registrar
				? sprintf(
						// translators: %s is the registrar name
						__( '1. Login to %s' ),
						registrar
				  )
				: __( '1. Login to your domain name provider' ),
			label: __( 'I have opened the DNS settings' ),
			content: (
				<Text>
					{ createInterpolateElement(
						// translators: <registrar/> is the domain name provider, <domain/> is the domain name
						__( 'Log in to <registrar/> and open DNS management for <domain/>.' ),

						{
							registrar:
								! isReseller && registrar_url ? (
									<ExternalLink href={ registrar_url }> { registrar } </ExternalLink>
								) : (
									<>{ registrar || __( 'your domain name provider' ) }</>
								),
							domain: <>{ domainName }</>,
						}
					) }
				</Text>
			),
		},
		{
			title: __( '2. Back up DNS records' ),
			label: __( 'I have downloaded the DNS records' ),
			content: (
				<Text>
					{ __(
						'It’s rare, but things can go sideways. Download your DNS records as a fallback, just in case.'
					) }
				</Text>
			),
		},
	];

	const suggestedModeSteps = [
		...commonSteps,
		{
			title: __( '3. Update name servers' ),
			label: __( 'I have updated the name servers' ),
			content: (
				<VStack spacing={ 6 }>
					<Text>{ __( 'Replace all name server records with the values below.' ) }</Text>
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

	const advancedModeSteps = [
		...commonSteps,
		{
			title: __( '3. Update DNS records' ),
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
										{ __( 'Use domain connect' ) }
									</Button>
								</HStack>
							</CardBody>
						</Card>
					) }
					<ConnectionModeCard
						mode={ DomainConnectionSetupMode.SUGGESTED }
						title={ __( 'I only use this domain name for my website' ) }
						description={ __( 'You’ll update your name servers to point to WordPress.com' ) }
						infoText={ sprintf(
							// translators: %s is the domain name
							__(
								'Name servers connect your domain name to your site. It may take up to 72 hours for %s to become visible across the internet. We’ll email you when it’s done.'
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
						title={ __( 'I use this domain name for email or other services' ) }
						description={ __( 'You’ll update DNS records (CNAME and A)' ) }
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
