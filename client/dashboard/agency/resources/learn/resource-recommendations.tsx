import {
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useId } from 'react';
import { RowArrows, useRowScroll } from '../../components/showcase/row-arrows';
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

// Mounted only with resources to show, as the row's scroll tracking attaches on mount.
function RecommendationsRow( { resources, onSelectResource }: ResourceRecommendationsProps ) {
	const headingId = useId();
	const { rowRef, canScroll, page } = useRowScroll< HTMLUListElement >();

	return (
		<VStack
			as="section"
			spacing={ 3 }
			aria-labelledby={ headingId }
			className="dashboard-resources-learn__recommendations-section"
		>
			<HStack>
				<Heading level={ 2 } size={ 15 } weight={ 500 } id={ headingId }>
					{ __( 'Recommended for you' ) }
				</Heading>
				<RowArrows
					canScroll={ canScroll }
					page={ page }
					labels={ {
						previous: __( 'Previous recommendations' ),
						next: __( 'Next recommendations' ),
					} }
				/>
			</HStack>
			<ul ref={ rowRef } className="dashboard-resources-learn__recommendations">
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

/** A row of recommended resources, scrolled with its previous and next buttons. */
export default function ResourceRecommendations( props: ResourceRecommendationsProps ) {
	return props.resources.length ? <RecommendationsRow { ...props } /> : null;
}
