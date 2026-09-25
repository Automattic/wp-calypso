import {
	VisuallyHidden,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import { Card, CardBody } from '../../../components/card';
import { getAudienceLabel, getStageLabel } from './labels';
import ResourceCardHeader from './resource-card-header';
import type { ResourceItem, RecordTracksEvent } from './types';
import type { MouseEvent } from 'react';

interface ResourceCardProps {
	resource: ResourceItem;
	onOpenVideoModal: ( resource: ResourceItem ) => void;
	recordTracksEvent: RecordTracksEvent;
	onResourceClick?: ( resource: ResourceItem ) => void;
	tracksEventName: string;
}

export default function ResourceCard( {
	resource,
	onOpenVideoModal,
	recordTracksEvent,
	onResourceClick,
	tracksEventName,
}: ResourceCardProps ) {
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

	const link = (
		// Its ::after covers the card, so the whole card is the link.
		<a
			className="dashboard-resources-learn__card-link"
			href={ resource.externalUrl }
			target="_blank"
			rel="noopener noreferrer"
			onClick={ handleClick }
		>
			{ resource.name }
			{ ! isVideo && (
				<VisuallyHidden as="span">
					{
						/* translators: accessibility text */
						__( '(opens in a new tab)' )
					}
				</VisuallyHidden>
			) }
		</a>
	);

	return (
		<Card className="dashboard-resources-learn__card">
			<ResourceCardHeader resource={ resource } title={ link } />
			<CardBody>
				<VStack spacing={ 3 } justify="flex-start">
					<Text variant="muted">{ resource.description }</Text>
					<HStack spacing={ 1 } justify="flex-start" wrap>
						<Badge intent="draft">{ getAudienceLabel( resource.audience ) }</Badge>
						<Badge intent="draft">{ getStageLabel( resource.stage ) }</Badge>
					</HStack>
				</VStack>
			</CardBody>
		</Card>
	);
}
