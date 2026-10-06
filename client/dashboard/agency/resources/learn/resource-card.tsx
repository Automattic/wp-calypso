import {
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { Badge } from '@wordpress/ui';
import { Card, CardBody } from '../../../components/card';
import { getAudienceLabel, getStageLabel } from './labels';
import ResourceCardHeader from './resource-card-header';
import ResourceLink from './resource-link';
import type { ResourceLinkProps } from './resource-link';

export default function ResourceCard( props: Omit< ResourceLinkProps, 'className' > ) {
	const { resource } = props;

	return (
		<Card className="dashboard-resources-learn__card">
			<ResourceCardHeader
				resource={ resource }
				title={ <ResourceLink { ...props } className="dashboard-resources-learn__card-link" /> }
			/>
			<CardBody>
				<VStack spacing={ 3 } justify="flex-start">
					<Text variant="muted" className="dashboard-resources-learn__card-description">
						{ resource.description }
					</Text>
					<HStack spacing={ 1 } justify="flex-start" wrap>
						<Badge intent="draft">{ getAudienceLabel( resource.audience ) }</Badge>
						<Badge intent="draft">{ getStageLabel( resource.stage ) }</Badge>
					</HStack>
				</VStack>
			</CardBody>
		</Card>
	);
}
