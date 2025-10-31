import {
	DomainConnectionSetupMode,
	DomainMappingSetupInfo,
	type DomainConnectionSetupModeValue,
} from '@automattic/api-core';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import ConnectionModeCard from './connection-mode-card';

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
				<ConnectionModeCard
					mode={ DomainConnectionSetupMode.SUGGESTED }
					title={ __( 'I only use this domain name for my website' ) }
					description={ __( "You'll update your name servers to point to WordPress.com" ) }
					infoText={ sprintf(
						// translators: %s is the domain name
						__(
							"Name servers connect your domain name to your site. It may take up to 72 hours for %s to become visible across the internet. We'll email you when it's done."
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
				/>

				<ConnectionModeCard
					mode={ DomainConnectionSetupMode.ADVANCED }
					title={ __( 'I use this domain name for email or other services' ) }
					description={ __( "You'll update DNS records (CNAME and A)" ) }
					infoText={ sprintf(
						// translators: %s is the domain name
						__(
							"DNS records point your domain name to your site. It may take up to 72 hours for %s to become visible across the internet. We'll email you when it's done."
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
				/>
			</VStack>
		</div>
	);
}
