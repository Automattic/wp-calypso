import {
	Card,
	CardBody,
	CardMedia,
	Button,
	Spinner,
	__experimentalHeading as Heading,
	__experimentalSpacer as Spacer,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { useResourceCtaLabel } from './hooks/use-resource-cta-label';
import type { ResourceItem } from './types';

interface ResourceSectionProps {
	title: string;
	description?: string;
	resources: ResourceItem[];
	isLoading: boolean;
	onOpenVideoModal: ( resource: ResourceItem ) => void;
	maxResources?: number;
	showLogo?: boolean;
	className?: string;
	tracksEventName: string;
}

function ResourceCard( {
	resource,
	onOpenVideoModal,
	showLogo = false,
	tracksEventName,
}: {
	resource: ResourceItem;
	onOpenVideoModal: ( resource: ResourceItem ) => void;
	showLogo?: boolean;
	tracksEventName: string;
} ) {
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
		<Card isBorderless size="none">
			<CardBody style={ { display: 'flex', flexDirection: 'column', height: '100%' } }>
				<VStack spacing={ 4 } style={ { flex: 1, justifyContent: 'flex-start' } }>
					{ resource.previewImage && (
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

export default function ResourceSection( {
	title,
	description,
	resources,
	isLoading,
	onOpenVideoModal,
	maxResources,
	showLogo = false,
	className = '',
	tracksEventName,
}: ResourceSectionProps ) {
	const marginBottom = description ? 6 : 4;

	if ( isLoading ) {
		return (
			<>
				<Spacer marginBottom={ marginBottom }>
					<Heading level={ 2 } weight={ 500 } size={ 20 }>
						{ title }
					</Heading>
					{ description && <Text size={ 15 }>{ description }</Text> }
				</Spacer>
				<div style={ { textAlign: 'center', padding: '40px 0' } }>
					<Spinner />
				</div>
				<Spacer marginBottom={ 12 } />
			</>
		);
	}

	if ( resources.length === 0 ) {
		return null;
	}

	const displayResources = maxResources ? resources.slice( 0, maxResources ) : resources;

	return (
		<>
			<Spacer marginBottom={ marginBottom }>
				<Heading level={ 2 } weight={ 500 } size={ 20 }>
					{ title }
				</Heading>
				{ description && <Text size={ 15 }>{ description }</Text> }
			</Spacer>

			<div className={ `resource-center-cards ${ className }` }>
				{ displayResources.map( ( resource ) => (
					<ResourceCard
						key={ resource.id }
						resource={ resource }
						onOpenVideoModal={ onOpenVideoModal }
						showLogo={ showLogo }
						tracksEventName={ tracksEventName }
					/>
				) ) }
			</div>

			<Spacer marginBottom={ 12 } />
		</>
	);
}
