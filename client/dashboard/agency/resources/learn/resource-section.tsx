import {
	__experimentalHeading as Heading,
	__experimentalSpacer as Spacer,
	__experimentalText as Text,
	__experimentalGrid as Grid,
} from '@wordpress/components';
import ResourceCard from './resource-card';
import type { ResourceItem, RecordTracksEvent } from './types';

interface ResourceSectionProps {
	title: string;
	description?: string;
	resources: ResourceItem[];
	onOpenVideoModal: ( resource: ResourceItem ) => void;
	recordTracksEvent: RecordTracksEvent;
	onResourceClick?: ( resource: ResourceItem ) => void;
	maxResources?: number;
	showLogo?: boolean;
	columnMinWidth?: number;
	tracksEventName: string;
}

export default function ResourceSection( {
	title,
	description,
	resources,
	onOpenVideoModal,
	recordTracksEvent,
	onResourceClick,
	maxResources,
	showLogo = false,
	columnMinWidth = 280,
	tracksEventName,
}: ResourceSectionProps ) {
	const marginBottom = description ? 6 : 4;

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
				{ description && (
					<Text size={ 15 } style={ { display: 'block', maxWidth: '650px' } }>
						{ description }
					</Text>
				) }
			</Spacer>

			<Grid
				templateColumns={ `repeat( auto-fit, minmax( ${ columnMinWidth }px, 1fr ) )` }
				gap={ 8 }
			>
				{ displayResources.map( ( resource ) => (
					<ResourceCard
						key={ resource.id }
						resource={ resource }
						onOpenVideoModal={ onOpenVideoModal }
						recordTracksEvent={ recordTracksEvent }
						onResourceClick={ onResourceClick }
						showLogo={ showLogo }
						showPreviewImage
						tracksEventName={ tracksEventName }
						isBorderless
					/>
				) ) }
			</Grid>

			<Spacer marginBottom={ 12 } />
		</>
	);
}
