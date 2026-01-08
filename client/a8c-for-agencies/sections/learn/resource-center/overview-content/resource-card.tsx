import {
	Card,
	CardBody,
	CardMedia,
	Button,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { useResourceCtaLabel } from './hooks/use-resource-cta-label';
import type { ResourceItem } from './types';

interface ResourceCardProps {
	resource: ResourceItem;
	onOpenVideoModal: ( resource: ResourceItem ) => void;
	showLogo?: boolean;
	showPreviewImage?: boolean;
	tracksEventName: string;
	isBorderless?: boolean;
}

export default function ResourceCard( {
	resource,
	onOpenVideoModal,
	showLogo = false,
	showPreviewImage = false,
	tracksEventName,
	isBorderless = false,
}: ResourceCardProps ) {
	const dispatch = useDispatch();
	const ctaLabel = useResourceCtaLabel( resource.format );
	const isVideo = resource.format === 'Video';

	const handleClick = ( e: React.MouseEvent ) => {
		if ( isVideo ) {
			e.preventDefault();
			onOpenVideoModal( resource );
		}

		dispatch(
			recordTracksEvent( tracksEventName, {
				resource_id: resource.id,
				resource_name: resource.name,
			} )
		);
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
