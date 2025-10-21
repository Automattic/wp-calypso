import { Badge } from '@automattic/ui';
import {
	Card,
	CardBody,
	Icon,
	__experimentalText as Text,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { swatch } from '@wordpress/icons';
import './domain-connection-verification.scss';

interface DomainConnectionVerificationProps {
	domainName: string;
}

export default function DomainConnectionVerification( {
	domainName,
}: DomainConnectionVerificationProps ) {
	return (
		<Card>
			<CardBody>
				<HStack justify="flex-start">
					<Icon icon={ swatch } />
					<Text className="domain-connection-verification-title" size={ 10 }>
						{ domainName }
					</Text>
					<Badge intent="warning">Verifying</Badge>
				</HStack>
			</CardBody>
		</Card>
	);
}
