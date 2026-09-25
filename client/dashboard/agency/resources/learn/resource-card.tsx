import {
	Button,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { Badge } from '@wordpress/ui';
import { ButtonStack } from '../../../components/button-stack';
import { Card, CardBody } from '../../../components/card';
import { getAudienceLabel, getStageLabel } from './labels';
import { useResourceCtaLabel } from './use-resource-cta-label';
import type { ResourceItem, RecordTracksEvent } from './types';
import type { MouseEvent } from 'react';

interface ResourceCardProps {
	resource: ResourceItem;
	onOpenVideoModal: ( resource: ResourceItem ) => void;
	recordTracksEvent: RecordTracksEvent;
	onResourceClick?: ( resource: ResourceItem ) => void;
	showLogo?: boolean;
	tracksEventName: string;
}

export default function ResourceCard( {
	resource,
	onOpenVideoModal,
	recordTracksEvent,
	onResourceClick,
	showLogo = false,
	tracksEventName,
}: ResourceCardProps ) {
	const ctaLabel = useResourceCtaLabel( resource.format );
	const isVideo = resource.format === 'video';

	const handleClick = ( event: MouseEvent ) => {
		if ( isVideo ) {
			event.preventDefault();
			onOpenVideoModal( resource );
		}

		recordTracksEvent( tracksEventName, {
			resource_id: resource.id,
			resource_name: resource.name,
		} );

		// Host-specific side effect (a8c records the event server-side).
		onResourceClick?.( resource );
	};

	return (
		<Card className="dashboard-resources-learn__card">
			<CardBody className="dashboard-resources-learn__card-body">
				<VStack spacing={ 3 } justify="flex-start" className="dashboard-resources-learn__card-main">
					{ showLogo && <HStack>{ resource.logo }</HStack> }
					<VStack spacing={ 1 }>
						<Text weight={ 500 }>{ resource.name }</Text>
						<Text variant="muted">{ resource.description }</Text>
					</VStack>
					<HStack spacing={ 1 } justify="flex-start" wrap>
						<Badge intent="draft">{ getAudienceLabel( resource.audience ) }</Badge>
						<Badge intent="draft">{ getStageLabel( resource.stage ) }</Badge>
					</HStack>
				</VStack>
				<ButtonStack justify="flex-start" className="dashboard-resources-learn__card-footer">
					<Button
						variant="secondary"
						{ ...( ! isVideo && { href: resource.externalUrl, target: '_blank' } ) }
						onClick={ handleClick }
					>
						{ ctaLabel }
					</Button>
				</ButtonStack>
			</CardBody>
		</Card>
	);
}
