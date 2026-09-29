import {
	Button,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { chevronDown, chevronLeft, chevronRight, Icon } from '@wordpress/icons';
import { useId, useState } from 'react';
import ResourceCover from './resource-cover';
import useResourceCarousel from './use-resource-carousel';
import type { LibraryResource } from './types';

const hiddenPreferenceKey = 'a4a-library-recommendations-hidden';

export default function ResourceRecommendations( {
	reason,
	resources,
	onOpen,
}: {
	reason: string;
	resources: LibraryResource[];
	onOpen: ( resource: LibraryResource, origin: DOMRect ) => void;
} ) {
	const [ expanded, setExpanded ] = useState( () => {
		try {
			return localStorage.getItem( hiddenPreferenceKey ) !== 'true';
		} catch {
			return true;
		}
	} );
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
				<div className="resource-recommendations-heading-copy">
					<Heading level={ 2 } size={ 14 } weight={ 500 } id={ headingId }>
						<button
							type="button"
							className="resource-recommendations-toggle"
							aria-expanded={ expanded }
							aria-controls={ listId }
							onClick={ () => {
								const nextExpanded = ! expanded;
								setExpanded( nextExpanded );
								try {
									localStorage.setItem( hiddenPreferenceKey, String( ! nextExpanded ) );
								} catch {
									// Keep the toggle usable when browser storage is unavailable.
								}
							} }
						>
							<span>
								{ expanded
									? __( 'Recommended for you' )
									: sprintf(
											/* translators: %d is the number of recommended resources. */
											__( 'Recommended for you (%d)' ),
											resources.length
									  ) }
							</span>
							<Icon icon={ expanded ? chevronDown : chevronRight } size={ 16 } />
						</button>
					</Heading>
					{ expanded && <p className="resource-recommendations-reason">{ reason }</p> }
				</div>
				<HStack
					className="resource-recommendations-navigation"
					spacing={ 1 }
					expanded={ false }
					style={ { visibility: expanded ? 'visible' : 'hidden' } }
					aria-hidden={ ! expanded }
				>
					<Button
						icon={ chevronLeft }
						label={ __( 'Previous recommendations' ) }
						size="compact"
						disabled={ ! expanded || edges.start }
						aria-controls={ listId }
						onClick={ () => scroll( -1 ) }
					/>
					<Button
						icon={ chevronRight }
						label={ __( 'Next recommendations' ) }
						size="compact"
						disabled={ ! expanded || edges.end }
						aria-controls={ listId }
						onClick={ () => scroll( 1 ) }
					/>
				</HStack>
			</HStack>
			<ul
				className="resource-recommendations-list"
				id={ listId }
				ref={ ref }
				tabIndex={ -1 }
				hidden={ ! expanded }
			>
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
