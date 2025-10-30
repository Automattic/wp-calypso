import { __experimentalText as Text, __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Card, CardBody } from '../../components/card';
import type { DomainMappingSetupInfo } from '@automattic/api-core';

interface DomainConnectionSetupProps {
	domainName: string;
	siteSlug: string;
	domainConnectionSetupInfo: DomainMappingSetupInfo;
}

export default function DomainConnectionSetup( { domainName }: DomainConnectionSetupProps ) {
	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					<Text>
						{ __( 'Domain connection setup workflow' ) }
						{ domainName }
					</Text>
				</VStack>
			</CardBody>
		</Card>
	);
}
