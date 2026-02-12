import {
	__experimentalHeading as Heading,
	__experimentalSpacer as Spacer,
	__experimentalText as Text,
} from '@wordpress/components';
import ResourceCard from './resource-card';
import type { ResourceItem } from './types';

interface ResourceSectionProps {
	title: string;
	description?: string;
	resources: ResourceItem[];
	onOpenVideoModal: ( resource: ResourceItem ) => void;
	maxResources?: number;
	showLogo?: boolean;
	className?: string;
	tracksEventName: string;
}

export default function ResourceSection( {
	title,
	description,
	resources,
	onOpenVideoModal,
	maxResources,
	showLogo = false,
	className = '',
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

			<div className={ `resource-center-cards ${ className }` }>
				{ displayResources.map( ( resource ) => (
					<ResourceCard
						key={ resource.id }
						resource={ resource }
						onOpenVideoModal={ onOpenVideoModal }
						showLogo={ showLogo }
						showPreviewImage
						tracksEventName={ tracksEventName }
						isBorderless
					/>
				) ) }
			</div>

			<Spacer marginBottom={ 12 } />
		</>
	);
}
