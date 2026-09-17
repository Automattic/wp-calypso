import {
	Button,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { Card, CardBody, CardMedia } from '../../../components/card';
import { useResourceCtaLabel } from './use-resource-cta-label';
import type { ResourceItem, RecordTracksEvent } from './types';
import type { MouseEvent } from 'react';

interface ResourceCardProps {
	resource: ResourceItem;
	onOpenVideoModal: ( resource: ResourceItem ) => void;
	recordTracksEvent: RecordTracksEvent;
	onResourceClick?: ( resource: ResourceItem ) => void;
	showLogo?: boolean;
	showPreviewImage?: boolean;
	tracksEventName: string;
	isBorderless?: boolean;
}

export default function ResourceCard( {
	resource,
	onOpenVideoModal,
	recordTracksEvent,
	onResourceClick,
	showLogo = false,
	showPreviewImage = false,
	tracksEventName,
	isBorderless = false,
}: ResourceCardProps ) {
	const ctaLabel = useResourceCtaLabel( resource.format );
	const isVideo = resource.format === 'Video';

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
		<Card isBorderless={ isBorderless } size={ isBorderless ? 'none' : undefined }>
			<CardBody style={ { display: 'flex', flexDirection: 'column', height: '100%' } }>
				<VStack spacing={ 4 } style={ { flex: 1, justifyContent: 'flex-start' } }>
					{ showPreviewImage && resource.previewImage && (
						<CardMedia style={ { borderRadius: '4px' } }>
							<img src={ resource.previewImage } alt={ resource.name } />
						</CardMedia>
					) }
					{ showLogo && <HStack>{ resource.logo }</HStack> }
					<VStack spacing={ 1 }>
						<Text size={ 13 } weight={ 500 }>
							{ resource.name }
						</Text>
						<Text variant="muted" size={ 12 }>
							{ resource.description }
						</Text>
					</VStack>
				</VStack>
				<Button
					variant="secondary"
					{ ...( ! isVideo && { href: resource.externalUrl, target: '_blank' } ) }
					onClick={ handleClick }
					style={ { marginTop: '24px', alignSelf: 'flex-start' } }
				>
					{ ctaLabel }
				</Button>
			</CardBody>
		</Card>
	);
}
