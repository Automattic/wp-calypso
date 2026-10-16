import {
	Button,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useMergeRefs, useResizeObserver } from '@wordpress/compose';
import { __, isRTL } from '@wordpress/i18n';
import { chevronLeft, chevronRight } from '@wordpress/icons';
import { useId, useRef, useState } from 'react';
import ResourceCardHeader from './card/header';
import ResourceLink from './resource-link';
import type { SelectResource } from './types';
import type { AgencyEnablementResource } from '@automattic/api-core';

function RecommendedResource( {
	resource,
	onSelect,
}: {
	resource: AgencyEnablementResource;
	onSelect: SelectResource;
} ) {
	return (
		<li className="dashboard-resources-learn__recommendation">
			<ResourceCardHeader
				resource={ resource }
				title={
					<ResourceLink
						resource={ resource }
						onSelect={ ( item, event ) => onSelect( item, event, 'recommended' ) }
					/>
				}
			>
				<Text
					color="inherit"
					size={ 14 }
					lineHeight={ 1.5 }
					truncate
					numberOfLines={ 3 }
					className="dashboard-resources-learn__recommendation-description"
				>
					{ resource.description }
				</Text>
			</ResourceCardHeader>
		</li>
	);
}

interface ResourceRecommendationsProps {
	resources: AgencyEnablementResource[];
	onSelectResource: SelectResource;
}

/** A row of recommended resources, scrolled with its previous and next buttons. */
export default function ResourceRecommendations( {
	resources,
	onSelectResource,
}: ResourceRecommendationsProps ) {
	const headingId = useId();
	const listRef = useRef< HTMLUListElement >( null );
	const [ edges, setEdges ] = useState( { atStart: true, atEnd: true } );

	const updateEdges = () => {
		const list = listRef.current;
		if ( ! list ) {
			return;
		}

		// scrollLeft runs negative in right-to-left layouts.
		const position = Math.abs( list.scrollLeft );
		const atStart = position <= 1;
		const atEnd = position >= list.scrollWidth - list.clientWidth - 1;
		setEdges( ( current ) =>
			current.atStart === atStart && current.atEnd === atEnd ? current : { atStart, atEnd }
		);
	};

	const resizeRef = useResizeObserver( updateEdges );
	const ref = useMergeRefs( [ listRef, resizeRef ] );

	// Moves the row along by one resource.
	const scroll = ( direction: 1 | -1 ) => {
		const list = listRef.current;
		const item = list?.firstElementChild;
		if ( ! list || ! item ) {
			return;
		}

		const gap = parseFloat( getComputedStyle( list ).columnGap ) || 0;
		list.scrollBy( {
			left: direction * ( item.getBoundingClientRect().width + gap ) * ( isRTL() ? -1 : 1 ),
			behavior: window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches
				? 'instant'
				: 'smooth',
		} );
	};

	if ( ! resources.length ) {
		return null;
	}

	return (
		<VStack as="section" spacing={ 3 } aria-labelledby={ headingId }>
			<HStack>
				<Heading level={ 2 } size={ 15 } weight={ 500 } id={ headingId }>
					{ __( 'Recommended for you' ) }
				</Heading>
				{ ! ( edges.atStart && edges.atEnd ) && (
					<HStack spacing={ 1 } expanded={ false }>
						<Button
							__next40pxDefaultSize
							size="compact"
							icon={ isRTL() ? chevronRight : chevronLeft }
							label={ __( 'Previous recommendations' ) }
							disabled={ edges.atStart }
							accessibleWhenDisabled
							onClick={ () => scroll( -1 ) }
						/>
						<Button
							__next40pxDefaultSize
							size="compact"
							icon={ isRTL() ? chevronLeft : chevronRight }
							label={ __( 'Next recommendations' ) }
							disabled={ edges.atEnd }
							accessibleWhenDisabled
							onClick={ () => scroll( 1 ) }
						/>
					</HStack>
				) }
			</HStack>
			<ul
				ref={ ref }
				className="dashboard-resources-learn__recommendations"
				onScroll={ updateEdges }
			>
				{ resources.map( ( resource ) => (
					<RecommendedResource
						key={ resource.id }
						resource={ resource }
						onSelect={ onSelectResource }
					/>
				) ) }
			</ul>
		</VStack>
	);
}
