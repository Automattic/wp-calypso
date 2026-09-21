import {
	Button,
	SelectControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { DataViews as WPDataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { learnRoute } from '../../../app/router/agency';
import { DataViews } from '../../../components/dataviews';
import { getResourceTags, topResources } from './resource-presentation';
import ResourcePreview from './resource-preview';
import ResourceProductLogo from './resource-product-logo';
import ResourceTags from './resource-tags';
import ResourceThumbnail from './resource-thumbnail';
import { sampleResources } from './sample-resources';
import useResourceCoverHeight from './use-resource-cover-height';
import useResourceLoadMore from './use-resource-load-more';
import type { Field, View } from '@wordpress/dataviews';

import './sample-resource-grid.scss';

type Resource = ( typeof sampleResources )[ number ];

const initialView: View = {
	type: 'grid',
	titleField: 'title',
	descriptionField: 'description',
	fields: [],
	showMedia: false,
	layout: { density: 'balanced', previewSize: 290 },
	page: 1,
	perPage: 24,
	search: '',
	filters: [],
};

const createFields = (
	onFilter: ( field: string, value: string ) => void
): Field< Resource >[] => [
	{
		id: 'title',
		label: __( 'Title' ),
		getValue: ( { item } ) => item.title,
		render: ( { item } ) => (
			<div className="resource-title-cover" data-product={ item.product }>
				<div className="resource-title-cover-label">
					<span>{ item.format }</span>
					{ topResources.includes( item.id ) && (
						<span className="resource-title-cover-featured">{ __( 'Top resource' ) }</span>
					) }
					<ResourceThumbnail format={ item.format } />
				</div>
				<span className="resource-title-cover-heading">{ item.title }</span>
				<div className="resource-title-cover-brand">
					<ResourceProductLogo product={ item.product } />
				</div>
			</div>
		),
		enableGlobalSearch: true,
	},
	{
		id: 'description',
		label: __( 'Description' ),
		getValue: ( { item } ) => item.description,
		render: ( { item } ) => (
			<VStack className="resource-card-details" spacing={ 3 }>
				<Text className="resource-description">{ item.description }</Text>
				<ResourceTags
					onFilter={ onFilter }
					tags={ getResourceTags( item, false ).filter( ( tag ) => tag.field !== 'featured' ) }
				/>
			</VStack>
		),
		enableGlobalSearch: true,
	},
	{
		id: 'featured',
		label: __( 'Highlight' ),
		type: 'text',
		getValue: ( { item } ) => ( topResources.includes( item.id ) ? __( 'Top resource' ) : '' ),
		elements: [ { value: __( 'Top resource' ), label: __( 'Top resource' ) } ],
		filterBy: { operators: [ 'is' ] },
	},
	{
		id: 'product',
		label: __( 'Product' ),
		type: 'text',
		getValue: ( { item } ) => item.product,
		enableGlobalSearch: true,
		elements: Array.from( new Set( sampleResources.map( ( item ) => item.product ) ) ).map(
			( value ) => ( { value, label: value } )
		),
		filterBy: { operators: [ 'is', 'isAny' ] },
	},
	{
		id: 'audience',
		label: __( 'Audience' ),
		type: 'text',
		getValue: ( { item } ) => item.audience,
		enableGlobalSearch: true,
		elements: [ 'All audiences', 'Developer', 'Business', 'Client' ].map( ( value ) => ( {
			value,
			label: value,
		} ) ),
		filterBy: { operators: [ 'is', 'isAny' ] },
	},

	{
		id: 'format',
		label: __( 'Content type' ),
		type: 'text',
		getValue: ( { item } ) => item.format,
		enableGlobalSearch: true,
		elements: Array.from( new Set( sampleResources.map( ( item ) => item.format ) ) ).map(
			( value ) => ( { value, label: value } )
		),
		filterBy: { operators: [ 'is', 'isAny' ] },
	},
];

export default function SampleResourceGrid() {
	const [ view, setView ] = useState< View >( initialView );
	const [ stage, setStage ] = useState( 'All' );
	const { resource: resourceId } = learnRoute.useSearch();
	const navigate = learnRoute.useNavigate();
	const [ origin, setOrigin ] = useState< DOMRect | null >( null );
	const selectedResource = sampleResources.find( ( item ) => item.id === resourceId );
	const applyTagFilter = useCallback( ( field: string, value: string ) => {
		if ( field === 'stage' ) {
			setStage( value );
			setView( ( current ) => ( { ...current, page: 1 } ) );
			return;
		}
		setView( ( current ) => ( {
			...current,
			page: 1,
			filters: [
				...( current.filters ?? [] ).filter( ( filter ) => filter.field !== field ),
				{ field, operator: 'is', value },
			],
		} ) );
	}, [] );
	const libraryRef = useResourceCoverHeight();
	const fields = useMemo( () => createFields( applyTagFilter ), [ applyTagFilter ] );

	const navigationResources = useMemo(
		() =>
			filterSortAndPaginate(
				stage === 'All'
					? sampleResources
					: sampleResources.filter( ( item ) => item.stage === stage ),
				{ ...view, page: 1, perPage: sampleResources.length },
				fields
			).data,
		[ stage, view, fields ]
	);
	const queryKey = JSON.stringify( [ stage, view.search, view.filters, view.sort ] );
	const { visibleCount, hasMore, loadMore, sentinelRef } = useResourceLoadMore(
		navigationResources.length,
		queryKey,
		!! selectedResource
	);
	const data = useMemo(
		() => navigationResources.slice( 0, visibleCount ),
		[ navigationResources, visibleCount ]
	);
	const pendingFocus = useRef< number | null >( null );
	useEffect( () => {
		if ( pendingFocus.current !== null ) {
			libraryRef.current
				?.querySelectorAll< HTMLElement >( '[role="gridcell"]' )
				[ pendingFocus.current ]?.focus( { preventScroll: true } );
			pendingFocus.current = null;
		}
	}, [ data, libraryRef ] );

	const resourceIndex = navigationResources.findIndex( ( item ) => item.id === resourceId );

	return (
		<div
			ref={ libraryRef }
			className="sample-resource-library"
			onKeyDownCapture={ ( event ) => {
				const target = event.target;
				if (
					target instanceof HTMLElement &&
					target.getAttribute( 'role' ) === 'gridcell' &&
					( event.key === 'Enter' || event.key === ' ' )
				) {
					event.preventDefault();
					event.stopPropagation();
					target.querySelector< HTMLAnchorElement >( '.dataviews-title-field' )?.click();
				}
			} }
		>
			<DataViews< Resource >
				data={ data }
				fields={ fields }
				view={ view }
				onChangeView={ setView }
				paginationInfo={ { totalItems: navigationResources.length, totalPages: 1 } }
				defaultLayouts={ { grid: { showMedia: false } } }
				getItemId={ ( item ) => item.id }
				searchLabel={ __( 'Search resources' ) }
				renderItemLink={ ( { item, ...props } ) => (
					<a
						{ ...props }
						title={ undefined }
						aria-label={ item.title }
						tabIndex={ -1 }
						href={ `?resource=${ item.id }` }
						onClick={ ( event ) => {
							if ( event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ) {
								return;
							}
							event.preventDefault();
							const card = event.currentTarget.closest( '[role="gridcell"]' );
							setOrigin( card?.getBoundingClientRect() ?? null );

							void navigate( {
								search: ( previous: ReturnType< typeof learnRoute.useSearch > ) => ( {
									...previous,
									resource: item.id,
								} ),
								resetScroll: false,
							} );
						} }
					/>
				) }
			>
				<HStack className="resource-toolbar" spacing={ 3 } alignment="top" wrap>
					<HStack className="resource-toolbar-search" spacing={ 2 } expanded={ false }>
						<WPDataViews.Search label={ __( 'Search resources' ) } />
						<WPDataViews.FiltersToggle />
					</HStack>
					<HStack className="resource-toolbar-options" spacing={ 2 } expanded={ false }>
						<div className="resource-stage-select">
							<SelectControl
								size="compact"
								label={ __( 'Browse resources' ) }
								hideLabelFromVision
								value={ stage }
								options={ [
									{ label: __( 'All resources' ), value: 'All' },
									...[ 'Learn', 'Sell', 'Manage', 'Grow' ].map( ( value ) => ( {
										label: value,
										value,
									} ) ),
								] }
								onChange={ ( value ) => {
									setStage( value );
									setView( { ...view, page: 1 } );
								} }
								__nextHasNoMarginBottom
							/>
						</div>
						<div className="resource-stage-segments">
							<ToggleGroupControl
								className="resource-stage-control"
								label={ __( 'Browse resources' ) }
								hideLabelFromVision
								value={ stage }
								onChange={ ( value ) => {
									setStage( String( value ) );
									setView( { ...view, page: 1 } );
								} }
								isBlock
								__nextHasNoMarginBottom
								__next40pxDefaultSize
							>
								{ [ 'All', 'Learn', 'Sell', 'Manage', 'Grow' ].map( ( value ) => (
									<ToggleGroupControlOption key={ value } value={ value } label={ value } />
								) ) }
							</ToggleGroupControl>
						</div>
					</HStack>
				</HStack>
				{ view.filters?.length ? (
					<WPDataViews.Filters className="dataviews-filters__container" />
				) : (
					<WPDataViews.FiltersToggled className="dataviews-filters__container" />
				) }
				<DataViews.Layout />
				{ navigationResources.length > 0 && (
					<VStack className="resource-load-more" spacing={ 3 } alignment="center">
						<div ref={ sentinelRef } aria-hidden="true" />
						<Text role="status" aria-live="polite" aria-atomic="true">
							{ sprintf(
								/* translators: %1$d: visible resources, %2$d: total matching resources. */
								__( 'Showing %1$d of %2$d resources' ),
								visibleCount,
								navigationResources.length
							) }
						</Text>
						{ hasMore && (
							<Button
								variant="secondary"
								onClick={ () => {
									pendingFocus.current = visibleCount;
									loadMore();
								} }
							>
								{ __( 'Load more' ) }
							</Button>
						) }
					</VStack>
				) }
			</DataViews>
			{ selectedResource && (
				<ResourcePreview
					resource={ selectedResource }
					onFilter={ ( field, value ) => {
						applyTagFilter( field, value );
						setOrigin( null );
						void navigate( {
							search: ( previous: ReturnType< typeof learnRoute.useSearch > ) => ( {
								...previous,
								resource: undefined,
							} ),
							replace: true,
							resetScroll: false,
						} );
					} }
					origin={ origin }
					previousResource={ navigationResources[ resourceIndex - 1 ] }
					nextResource={ navigationResources[ resourceIndex + 1 ] }
					onPrevious={
						resourceIndex > 0
							? () => {
									void navigate( {
										search: ( previous: ReturnType< typeof learnRoute.useSearch > ) => ( {
											...previous,
											resource: navigationResources[ resourceIndex - 1 ].id,
										} ),
										replace: true,
										resetScroll: false,
									} );
							  }
							: undefined
					}
					onNext={
						resourceIndex >= 0 && resourceIndex < navigationResources.length - 1
							? () => {
									void navigate( {
										search: ( previous: ReturnType< typeof learnRoute.useSearch > ) => ( {
											...previous,
											resource: navigationResources[ resourceIndex + 1 ].id,
										} ),
										replace: true,
										resetScroll: false,
									} );
							  }
							: undefined
					}
					onClose={ () => {
						setOrigin( null );
						void navigate( {
							search: ( previous: ReturnType< typeof learnRoute.useSearch > ) => ( {
								...previous,
								resource: undefined,
							} ),
							replace: true,
							resetScroll: false,
						} );
					} }
				/>
			) }
		</div>
	);
}
