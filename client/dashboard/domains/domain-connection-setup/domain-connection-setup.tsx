import {
	DomainConnectionSetupMode,
	DomainMappingSetupInfo,
	type DomainConnectionSetupModeValue,
} from '@automattic/api-core';
import {
	Button,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';

interface DomainConnectionSetupProps {
	domainName: string;
	siteSlug: string;
	domainConnectionSetupInfo: DomainMappingSetupInfo;
	onVerifyConnection: ( mode: DomainConnectionSetupModeValue ) => void;
	isUpdatingConnectionMode: boolean;
}

export default function DomainConnectionSetup( {
	domainName,
	onVerifyConnection,
	isUpdatingConnectionMode,
}: DomainConnectionSetupProps ) {
	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					<Text>
						{ __( 'Domain connection setup workflow' ) }
						{ domainName }
					</Text>

					<ButtonStack justify="flex-start">
						<Button
							variant="primary"
							onClick={ () => onVerifyConnection( DomainConnectionSetupMode.SUGGESTED ) }
							isBusy={ isUpdatingConnectionMode }
						>
							{ __( 'Verify Connection (Suggested)' ) }
						</Button>
						<Button
							variant="primary"
							onClick={ () => onVerifyConnection( DomainConnectionSetupMode.ADVANCED ) }
							isBusy={ isUpdatingConnectionMode }
						>
							{ __( 'Verify Connection (Advanced)' ) }
						</Button>
					</ButtonStack>
				</VStack>
			</CardBody>
		</Card>
	);
}
