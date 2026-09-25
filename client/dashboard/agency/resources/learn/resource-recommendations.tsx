import {
	Button,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chevronLeft, chevronRight } from '@wordpress/icons';
import { useId } from 'react';
import ResourceCover from './resource-cover';
import useResourceCarousel from './use-resource-carousel';
import type { LibraryResource } from './types';

export default function ResourceRecommendations( {
	reason,
	resources,
	onOpen,
}: {
	reason: string;
	resources: LibraryResource[];
	onOpen: ( resource: LibraryResource, origin: DOMRect ) => void;
} ) {
	const headingId = useId();
	const listId = useId();
	const { ref, edges, scroll } = useResourceCarousel(
		resources.map( ( item ) => item.id ).join( ',' )
	);
	if ( ! resources.length ) {
		return null;
	}
	return (
		<section className="resource-recommendations" aria-labelledby={ headingId }>
			<HStack className="resource-recommendations-heading" spacing={ 3 }>
				<Heading level={ 2 } size={ 14 } weight={ 500 } id={ headingId }>
					{ reason }
				</Heading>
				<HStack spacing={ 1 } expanded={ false }>
					<Button
						icon={ chevronLeft }
						label={ __( 'Previous recommendations' ) }
						size="compact"
						disabled={ edges.start }
						aria-controls={ listId }
						onClick={ () => scroll( -1 ) }
					/>
					<Button
						icon={ chevronRight }
						label={ __( 'Next recommendations' ) }
						size="compact"
						disabled={ edges.end }
						aria-controls={ listId }
						onClick={ () => scroll( 1 ) }
					/>
				</HStack>
			</HStack>
			<ul className="resource-recommendations-list" id={ listId } ref={ ref } tabIndex={ -1 }>
				{ resources.map( ( resource ) => (
					<li key={ resource.id }>
						<a
							className="resource-recommendation"
							href={ `?resource=${ resource.id }` }
							aria-label={ resource.title }
							onClick={ ( event ) => {
								if ( event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ) {
									return;
								}
								event.preventDefault();
								onOpen( resource, event.currentTarget.getBoundingClientRect() );
							} }
						>
							<ResourceCover resource={ resource } showDescription />
						</a>
					</li>
				) ) }
			</ul>
		</section>
	);
}
