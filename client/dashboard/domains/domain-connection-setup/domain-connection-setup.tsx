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
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardHeader } from '../../components/card';

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
}: DomainConnectionSetupProps ) {
	const [ connectionMode, setConnectionMode ] = useState< 'suggested' | 'advanced' >( 'suggested' );
	return (
		<>
			<Card>
				<CardHeader>
					<HStack spacing={ 2 } justify="flex-start">
						<RadioControl
							selected={ connectionMode }
							options={ [ { label: '', value: 'suggested' } ] }
							onChange={ ( value: string ) =>
								setConnectionMode( value as 'suggested' | 'advanced' )
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
			</Card>

			<Card>
				<CardHeader>
					<HStack spacing={ 2 } justify="flex-start">
						<RadioControl
							selected={ connectionMode }
							options={ [ { label: '', value: 'advanced' } ] }
							onChange={ ( value: string ) =>
								setConnectionMode( value as 'suggested' | 'advanced' )
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
			</Card>

			<ButtonStack justify="flex-start">
				<Button
					variant="primary"
					onClick={ () => onVerifyConnection( DomainConnectionSetupMode.SUGGESTED ) }
					isBusy={ isUpdatingConnectionMode }
				>
					{ __( 'Verify Connection (Suggested)' ) }
				</Button>
			</ButtonStack>
		</>
	);
}
