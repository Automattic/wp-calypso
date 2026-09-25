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
			<CardBody>
				<VStack spacing={ 3 } justify="flex-start">
					{ showLogo && <HStack>{ resource.logo }</HStack> }
					<VStack spacing={ 1 }>
						<Text weight={ 500 }>
							{ /* Its ::after covers the card, so the whole card is the link. */ }
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
						</Text>
						<Text variant="muted">{ resource.description }</Text>
					</VStack>
					<HStack spacing={ 1 } justify="flex-start" wrap>
						<Badge intent="draft">{ getAudienceLabel( resource.audience ) }</Badge>
						<Badge intent="draft">{ getStageLabel( resource.stage ) }</Badge>
					</HStack>
				</VStack>
			</CardBody>
		</Card>
	);
}
