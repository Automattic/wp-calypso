import {
	Card,
	CardHeader,
	CardMedia,
	CardBody,
	Button,
	Spinner,
	__experimentalHeading as Heading,
	__experimentalSpacer as Spacer,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import type { ResourceItem } from './types';

interface ArtOfTheDealProps {
	resources: ResourceItem[];
	isLoading: boolean;
}

function DealCard( { resource }: { resource: ResourceItem } ) {
	const dispatch = useDispatch();

	const handleClick = () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_resource_center_art_of_deal_click', {
				resource_id: resource.id,
				resource_name: resource.name,
			} )
		);
	};

	return (
		<Card isBorderless size="none" style={ { width: '50%' } }>
			<CardMedia style={ { borderRadius: '4px' } }>
				{ resource.previewImage ? (
					<img src={ resource.previewImage } alt={ resource.name } />
				) : (
					<div
						style={ {
							width: '100%',
							height: '150px',
							backgroundColor: 'var(--color-neutral-10)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						} }
					>
						<Text variant="muted">{ __( 'No preview available' ) }</Text>
					</div>
				) }
			</CardMedia>
			<CardHeader
				size={ {
					blockStart: 'small',
					blockEnd: 'none',
					inlineStart: 'none',
					inlineEnd: 'none',
				} }
			>
				<Heading level={ 3 } weight={ 500 } size={ 16 }>
					{ resource.title || resource.name }
				</Heading>
			</CardHeader>
			<CardBody>
				<VStack spacing={ 2 }>
					<Text>{ resource.description }</Text>
					{ resource.cta && (
						<Button
							variant="secondary"
							href={ resource.cta.url }
							target="_blank"
							onClick={ handleClick }
						>
							{ resource.cta.label }
						</Button>
					) }
				</VStack>
			</CardBody>
		</Card>
	);
}

export default function ArtOfTheDeal( { resources, isLoading }: ArtOfTheDealProps ) {
	if ( isLoading ) {
		return (
			<>
				<Spacer marginBottom={ 6 }>
					<Heading level={ 2 } weight={ 500 } size={ 20 }>
						{ __( 'The art of the deal' ) }
					</Heading>
					<Text size={ 15 }>
						{ __( 'Learn tips from our world-class sales team to win clients!' ) }
					</Text>
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

	// Limit to first 2 resources
	const displayResources = resources.slice( 0, 2 );

	return (
		<>
			<Spacer marginBottom={ 6 }>
				<Heading level={ 2 } weight={ 500 } size={ 20 }>
					{ __( 'The art of the deal' ) }
				</Heading>
				<Text size={ 15 }>
					{ __( 'Learn tips from our world-class sales team to win clients!' ) }
				</Text>
			</Spacer>

			<HStack spacing={ 6 } style={ { justifyContent: 'space-between' } } alignment="stretch">
				{ displayResources.map( ( resource ) => (
					<DealCard key={ resource.id } resource={ resource } />
				) ) }
			</HStack>

			<Spacer marginBottom={ 12 } />
		</>
	);
}
