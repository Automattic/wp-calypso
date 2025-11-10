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
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { globe } from '@wordpress/icons';
import { useState } from 'react';
import { Card, CardBody } from '../../components/card';
import ConnectionModeCard from './connection-mode-card';
import DNSRecordsDataView from './dns-records-dataview';
import DomainConnectCard from './domain-connect-card';
import NameserversDataView from './nameservers-dataview';

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

	const suggestedModeSteps = [
		{
			title: __( '1. Login to your domain name provider' ),
			label: __( 'I have opened the DNS settings' ),
			content: (
				<Text>
					{ sprintf(
						// translators: %s is the domain name
						__( 'Log in to your domain name provider and open DNS management for %s.' ),
						domainName
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
		{
			title: __( '3. Update name servers' ),
			label: __( 'I have updated the name servers' ),
			content: (
				<VStack spacing={ 6 }>
					<Text>{ __( 'Replace all name server records with the values below.' ) }</Text>
					<NameserversDataView
						domainMappingStatus={ domainMappingStatus }
						domainConnectionSetupInfo={ domainConnectionSetupInfo }
					/>
				</VStack>
			),
		},
	];

	const advancedModeSteps = [
		{
			title: __( '1. Login to your domain name provider' ),
			label: __( 'I have opened the DNS settings' ),
			content: (
				<Text>
					{ sprintf(
						// translators: %s is the domain name
						__( 'Log in to your domain name provider and open DNS management for %s.' ),
						domainName
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
				<DomainConnectCard
					onChangeSetupMode={ () => setConnectionMode( recommendedMode ) }
					onVerifyConnection={ () => onVerifyConnection( DomainConnectionSetupMode.DC ) }
					isUpdatingConnectionMode={ isUpdatingConnectionMode }
					error={ queryError }
					errorDescription={ queryErrorDescription }
				/>
			</div>
		);
	}

	return (
		<div className="domain-connection-setup">
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
					description={ __( "You'll update DNS records (CNAME and A)" ) }
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
		</div>
	);
}
