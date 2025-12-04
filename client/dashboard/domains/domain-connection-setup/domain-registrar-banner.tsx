import {
	__experimentalText as Text,
	__experimentalHStack as HStack,
	ExternalLink,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Card, CardBody } from '../../components/card';

interface DomainRegistrarBannerProps {
	domainName: string;
	registrar?: string | null;
	registrar_url?: string | null;
	isReseller?: boolean;
}

export default function DomainRegistrarBanner( {
	domainName,
	registrar,
	registrar_url,
	isReseller = false,
}: DomainRegistrarBannerProps ) {
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
}
