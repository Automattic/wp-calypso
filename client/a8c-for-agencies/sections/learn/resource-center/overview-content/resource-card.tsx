import {
	Card,
	CardBody,
	CardMedia,
	Button,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import useRecordResourceEventMutation from 'calypso/a8c-for-agencies/data/learn/use-record-resource-event-mutation';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
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
	const agencyId = useSelector( getActiveAgencyId );
	const ctaLabel = useResourceCtaLabel( resource.format );
	const isVideo = resource.format === 'Video';
	const { mutate: recordResourceEvent } = useRecordResourceEventMutation();

	const handleClick = ( e: React.MouseEvent ) => {
		if ( isVideo ) {
			e.preventDefault();
			onOpenVideoModal( resource );
		}

		// Track event in analytics
		dispatch(
			recordTracksEvent( tracksEventName, {
				resource_id: resource.id,
				resource_name: resource.name,
			} )
		);

		// Record event in the API
		if ( agencyId ) {
			recordResourceEvent( {
				resourceId: resource.id,
				agencyId,
			} );
		}
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
