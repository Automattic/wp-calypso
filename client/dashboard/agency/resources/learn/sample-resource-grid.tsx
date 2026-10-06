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
import { closeSmall, Icon } from '@wordpress/icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { useAuth } from '../../../app/auth';
import { learnRoute } from '../../../app/router/agency';
import { DataViews } from '../../../components/dataviews';
import { hubRecommendationIds, hubResources } from './hub-resources';
import ResourceCover from './resource-cover';
import { getResourceTags, topResources } from './resource-presentation';
import ResourcePreview from './resource-preview';
import ResourceProductLogo from './resource-product-logo';
import ResourceRecommendations from './resource-recommendations';
import ResourceTags from './resource-tags';
import useResourceCoverHeight from './use-resource-cover-height';
import useResourceLoadMore from './use-resource-load-more';
import useResourceReadState from './use-resource-read-state';
import type { LibraryResource } from './types';
import type { Field, View } from '@wordpress/dataviews';

import './sample-resource-grid.scss';

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

const recommendedResources = hubRecommendationIds.flatMap( ( id ) =>
	hubResources.filter( ( item ) => item.id === id )
);

const createFields = (
	onFilter: ( field: string, value: string ) => void,
	onlyTopResources: boolean,
	viewType: View[ 'type' ],
	readIds: string[]
): Field< LibraryResource >[] => [
	{
		id: 'title',
		label: __( 'Title' ),
		getValue: ( { item } ) => item.title,
		render: ( { item } ) =>
			viewType === 'grid' ? (
				<ResourceCover
					resource={ item }
					featured={ topResources.includes( item.id ) }
					showType={ false }
				/>
			) : (
				<span className="resource-list-title" data-product={ item.product }>
					<span className="resource-list-title-text" dir="auto">
						{ item.title }
					</span>
				</span>
			),
		enableGlobalSearch: true,
	},
	{
		id: 'description',
		label: __( 'Description' ),
		getValue: ( { item } ) => item.description,
		render: ( { item } ) =>
			viewType === 'table' ? (
				<span className="resource-description resource-list-description" dir="auto">
					{ item.description }
				</span>
			) : (
				<VStack className="resource-card-details" spacing={ 3 }>
					{ item.description && <Text className="resource-description">{ item.description }</Text> }
					<ResourceTags
						onFilter={ onFilter }
						tags={ getResourceTags( item ).filter( ( tag ) => tag.field !== 'featured' ) }
					/>
				</VStack>
			),
		enableGlobalSearch: true,
	},
	{
		id: 'readStatus',
		label: __( 'Reading status' ),
		type: 'text',
		getValue: ( { item } ) => ( readIds.includes( item.id ) ? 'read' : 'unread' ),
		elements: [
			{ value: 'unread', label: __( 'Unread' ) },
			{ value: 'read', label: __( 'Read' ) },
		],
		filterBy: { operators: [ 'is' ] },
	},
	{
		id: 'featured',
		label: __( 'Top resources' ),
		type: 'text',
		getValue: ( { item } ) => ( topResources.includes( item.id ) ? __( 'Top resource' ) : '' ),
		elements: [ { value: __( 'Top resource' ), label: __( 'Top resource' ) } ],
		// A fixed-value filter needs no value picker once applied.
		filterBy: onlyTopResources ? false : { operators: [ 'is' ] },
	},
	{
		id: 'product',
		label: __( 'Brand' ),
		type: 'array',
		getValue: ( { item } ) => item.products ?? [ item.product ],
		render: ( { item } ) => (
			<span className="resource-list-brand" data-product={ item.product }>
				<ResourceProductLogo product={ item.product } />
			</span>
		),
		enableGlobalSearch: true,
		elements: Array.from(
			new Set( hubResources.flatMap( ( item ) => item.products ?? [ item.product ] ) )
		).map( ( value ) => ( { value, label: value } ) ),
		filterBy: { operators: [ 'isAny' ] },
	},
	{
		id: 'audience',
		label: __( 'Audience' ),
		type: 'text',
		getValue: ( { item } ) => item.audience,
		enableGlobalSearch: true,
		elements: Array.from( new Set( hubResources.map( ( item ) => item.audience ) ) ).map(
			( value ) => ( {
				value,
				label: value,
			} )
		),
		filterBy: { operators: [ 'is', 'isAny' ] },
	},

	{
		id: 'contentType',
		label: __( 'Content type' ),
		type: 'text',
		getValue: ( { item } ) => item.contentType,
		enableGlobalSearch: true,
		elements: Array.from( new Set( hubResources.map( ( item ) => item.contentType ) ) ).map(
			( value ) => ( { value, label: value } )
		),
		filterBy: { operators: [ 'is', 'isAny' ] },
	},
	{
		id: 'stage',
		label: __( 'Stage' ),
		type: 'text',
		getValue: ( { item } ) => item.stage,
		render: ( { item } ) => <span>{ item.stage || '—' }</span>,
		filterBy: false,
	},
	{
		id: 'format',
		label: __( 'Format' ),
		type: 'text',
		getValue: ( { item } ) => item.format,
		elements: [
			{ value: 'PDF', label: __( 'PDF' ) },
			{ value: 'Video', label: __( 'Video' ) },
			{ value: 'Webpage', label: __( 'Webpage' ) },
			{ value: 'Google Slides', label: __( 'Google Slides' ) },
			{ value: 'Google Docs', label: __( 'Google Docs' ) },
			{ value: 'Google Sheets', label: __( 'Google Sheets' ) },
		],
		filterBy: { operators: [ 'is', 'isAny' ] },
	},
];

export default function SampleResourceGrid() {
	const { user } = useAuth();
	const { readIds, setRead: saveRead, error: readError } = useResourceReadState( user.ID );
	const { recordTracksEvent } = useAnalytics();
	const setRead = useCallback(
		( id: string, read: boolean ) => {
			if ( saveRead( id, read ) ) {
				recordTracksEvent( 'calypso_a4a_resource_read_status_changed', {
					resource_id: id,
					is_read: read,
				} );
			}
		},
		[ saveRead, recordTracksEvent ]
	);
	const [ view, setView ] = useState< View >( initialView );
	const [ stage, setStage ] = useState( 'All' );
	const [ previewFromRecommendations, setPreviewFromRecommendations ] = useState( false );
	const { resource: resourceId } = learnRoute.useSearch();
	const navigate = learnRoute.useNavigate();
	const [ origin, setOrigin ] = useState< DOMRect | null >( null );
	const selectedResource = hubResources.find( ( item ) => item.id === resourceId );
	const onlyTopResources = view.filters?.some( ( filter ) => filter.field === 'featured' ) ?? false;
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
	const fields = useMemo(
		() => createFields( applyTagFilter, onlyTopResources, view.type, readIds ),
		[ applyTagFilter, onlyTopResources, view.type, readIds ]
	);

	const filteredResources = useMemo(
		() =>
			filterSortAndPaginate(
				hubResources,
				{ ...view, page: 1, perPage: hubResources.length },
				fields
			).data,
		[ view, fields ]
	);
	const navigationResources = useMemo(
		() => filteredResources.filter( ( item ) => stage === 'All' || item.stage === stage ),
		[ filteredResources, stage ]
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

	const navigationSnapshot = useRef( navigationResources );
	useEffect( () => {
		if ( ! selectedResource ) {
			navigationSnapshot.current = navigationResources;
		}
	}, [ navigationResources, selectedResource ] );
	const previewResources = previewFromRecommendations
		? recommendedResources
		: navigationSnapshot.current;
	const resourceIndex = previewResources.findIndex( ( item ) => item.id === resourceId );

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
			<ResourceRecommendations
				reason={ __( 'Based on your Pressable sites' ) }
				resources={ recommendedResources }
				onOpen={ ( item, bounds ) => {
					setPreviewFromRecommendations( true );
					setOrigin( bounds );
					void navigate( {
						search: ( previous: ReturnType< typeof learnRoute.useSearch > ) => ( {
							...previous,
							resource: item.id,
						} ),
						resetScroll: false,
						viewTransition: false,
					} );
				} }
			/>
			<DataViews< LibraryResource >
				data={ data }
				fields={ fields }
				view={
					view.type === 'table'
						? {
								...view,
								descriptionField: 'description',
								fields: [ 'product', 'contentType', 'stage' ],
						  }
						: view
				}
				onChangeView={ ( nextView ) =>
					setView( {
						...nextView,
						filters: nextView.filters?.map( ( filter ) =>
							filter.field === 'featured' ? { ...filter, value: __( 'Top resource' ) } : filter
						),
					} )
				}
				paginationInfo={ { totalItems: navigationResources.length, totalPages: 1 } }
				defaultLayouts={ { grid: { showMedia: false }, table: {} } }
				getItemId={ ( item ) => item.id }
				searchLabel={ __( 'Search resources' ) }
				renderItemLink={ ( { item, ...props } ) => (
					<a
						{ ...props }
						title={ undefined }
						aria-label={ item.title }
						tabIndex={ view.type === 'table' ? 0 : -1 }
						href={ `?resource=${ item.id }` }
						onClick={ ( event ) => {
							if ( event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ) {
								return;
							}
							event.preventDefault();
							setPreviewFromRecommendations( false );
							const card = event.currentTarget.closest( '[role="gridcell"], tr' );
							setOrigin( card?.getBoundingClientRect() ?? null );

							void navigate( {
								search: ( previous: ReturnType< typeof learnRoute.useSearch > ) => ( {
									...previous,
									resource: item.id,
								} ),
								resetScroll: false,
								viewTransition: false,
							} );
						} }
					/>
				) }
			>
				<HStack className="resource-toolbar" spacing={ 3 } alignment="top" wrap>
					<HStack className="resource-toolbar-search" spacing={ 2 } expanded={ false }>
						<WPDataViews.Search label={ __( 'Search resources' ) } />
						<ToggleGroupControl
							className="resource-view-toggle"
							label={ __( 'Resource layout' ) }
							hideLabelFromVision
							value={ view.type }
							onChange={ ( value ) => {
								if ( value !== 'grid' && value !== 'table' ) {
									return;
								}
								setView( ( current ) => ( {
									...current,
									type: value,
									descriptionField: 'description',
									fields: value === 'grid' ? [] : [ 'product', 'contentType', 'stage' ],
									layout: value === 'grid' ? initialView.layout : { density: 'balanced' },
								} ) );
							} }
							isBlock
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						>
							<ToggleGroupControlOption value="grid" label={ __( 'Grid' ) } />
							<ToggleGroupControlOption value="table" label={ __( 'List' ) } />
						</ToggleGroupControl>
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
								{ [
									{
										value: 'All',
										label: __( 'All' ),
										tooltip: __( 'Resources for every stage.' ),
									},
									{
										value: 'Learn',
										label: __( 'Learn' ),
										tooltip: __( 'Get to know our products.' ),
									},
									{
										value: 'Sell',
										label: __( 'Sell' ),
										tooltip: __( 'Prepare for client conversations.' ),
									},
									{
										value: 'Manage',
										label: __( 'Manage' ),
										tooltip: __( 'Deliver and support client projects.' ),
									},
									{
										value: 'Grow',
										label: __( 'Grow' ),
										tooltip: __( 'Build your agency and partnerships.' ),
									},
								].map( ( { value, label, tooltip } ) => (
									<ToggleGroupControlOption
										key={ value }
										value={ value }
										label={ label }
										aria-label={ tooltip }
										showTooltip
									/>
								) ) }
							</ToggleGroupControl>
						</div>
					</HStack>
				</HStack>
				{ view.filters?.length ? (
					<HStack className="dataviews-filters__container" spacing={ 2 } justify="flex-start" wrap>
						{ onlyTopResources && (
							<div className="dataviews-filters__summary-chip-container">
								<span className="dataviews-filters__summary-chip has-reset has-values is-not-clickable">
									{ __( 'Top resources' ) }
								</span>
								<button
									type="button"
									className="dataviews-filters__summary-chip-remove has-values"
									aria-label={ __( 'Remove Top resources filter' ) }
									onClick={ () =>
										setView( ( current ) => ( {
											...current,
											page: 1,
											filters: current.filters?.filter( ( filter ) => filter.field !== 'featured' ),
										} ) )
									}
								>
									<Icon icon={ closeSmall } />
								</button>
							</div>
						) }
						<WPDataViews.Filters />
					</HStack>
				) : (
					<WPDataViews.FiltersToggled className="dataviews-filters__container" />
				) }
				{ readError && (
					<Text role="alert">
						{ __(
							'Could not save your reading status. Please allow browser storage and try again.'
						) }
					</Text>
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
					isRead={ readIds.includes( selectedResource.id ) }
					readError={ readError }
					onToggleRead={ () =>
						setRead( selectedResource.id, ! readIds.includes( selectedResource.id ) )
					}
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
							viewTransition: false,
						} );
					} }
					origin={ origin }
					previousResource={ previewResources[ resourceIndex - 1 ] }
					nextResource={ resourceIndex >= 0 ? previewResources[ resourceIndex + 1 ] : undefined }
					onPrevious={
						resourceIndex > 0
							? () => {
									void navigate( {
										search: ( previous: ReturnType< typeof learnRoute.useSearch > ) => ( {
											...previous,
											resource: previewResources[ resourceIndex - 1 ].id,
										} ),
										replace: true,
										resetScroll: false,
										viewTransition: false,
									} );
							  }
							: undefined
					}
					onNext={
						resourceIndex >= 0 && resourceIndex < previewResources.length - 1
							? () => {
									void navigate( {
										search: ( previous: ReturnType< typeof learnRoute.useSearch > ) => ( {
											...previous,
											resource: previewResources[ resourceIndex + 1 ].id,
										} ),
										replace: true,
										resetScroll: false,
										viewTransition: false,
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
							viewTransition: false,
						} );
					} }
				/>
			) }
		</div>
	);
}
