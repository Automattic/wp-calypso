import {
	SelectControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { DataViews as WPDataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useCallback, useMemo, useState, type CSSProperties } from 'react';
import { learnRoute } from '../../../app/router/agency';
import { DataViews } from '../../../components/dataviews';
import { getResourceColorSlot, getResourceTags, topResources } from './resource-presentation';
import ResourcePreview from './resource-preview';
import ResourceProductLogo from './resource-product-logo';
import ResourceTags from './resource-tags';
import ResourceThumbnail from './resource-thumbnail';
import { sampleResources } from './sample-resources';
import TemporaryDesignSwitch, {
	type CardPalette,
	type CardColorBy,
	type CardIntensity,
	type CardLogoPlacement,
} from './temporary-design-switch';
import useResourceCoverHeight from './use-resource-cover-height';
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
	onFilter: ( field: string, value: string ) => void,
	design: 'original' | 'typographic',
	colorBy: CardColorBy
): Field< Resource >[] => [
	{
		id: 'title',
		label: __( 'Title' ),
		getValue: ( { item } ) => item.title,
		render: ( { item } ) =>
			design === 'typographic' ? (
				<div
					className="resource-title-cover"
					data-product={ item.product }
					data-color-slot={ getResourceColorSlot( item, colorBy ) }
				>
					<div className="resource-title-cover-label">
						<span>{ item.format }</span>
						<ResourceThumbnail compact format={ item.format } resourceId={ item.id } />
					</div>
					<span className="resource-title-cover-heading">{ item.title }</span>
					<div className="resource-title-cover-brand">
						<ResourceProductLogo product={ item.product } />
					</div>
				</div>
			) : (
				<VStack spacing={ 3 }>
					<ResourceThumbnail
						imageUrl={ item.imageUrl }
						format={ item.format }
						resourceId={ item.id }
					/>
					<span className="resource-card-title">{ item.title }</span>
				</VStack>
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
					tags={ getResourceTags( item, design === 'original' ) }
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
	const { resource: resourceId, designTools } = learnRoute.useSearch();
	const navigate = learnRoute.useNavigate();
	const [ origin, setOrigin ] = useState< DOMRect | null >( null );
	const selectedResource = sampleResources.find( ( item ) => item.id === resourceId );
	const applyTagFilter = useCallback( ( field: string, value: string ) => {
		setView( ( current ) => ( {
			...current,
			page: 1,
			filters: [
				...( current.filters ?? [] ).filter( ( filter ) => filter.field !== field ),
				{ field, operator: 'is', value },
			],
		} ) );
	}, [] );
	const [ design, setDesign ] = useState< 'original' | 'typographic' >( 'typographic' );
	const [ colorBy, setColorBy ] = useState< CardColorBy >( 'product' );
	const [ palettes, setPalettes ] = useState< Record< CardColorBy, CardPalette > >( {
		product: 'product-brand',
		type: 'ink-paper',
		single: 'ink-paper',
	} );
	const selectedPalette = palettes[ colorBy ];
	const palette =
		colorBy === 'type' && ( selectedPalette === 'product-brand' || selectedPalette === 'a4a-brand' )
			? 'ink-paper'
			: selectedPalette;
	const [ singleColor, setSingleColor ] = useState( '#dcdcde' );
	const colorChannels = [ 1, 3, 5 ].map( ( offset ) => {
		const channel = parseInt( singleColor.slice( offset, offset + 2 ), 16 ) / 255;
		return channel <= 0.04045 ? channel / 12.92 : ( ( channel + 0.055 ) / 1.055 ) ** 2.4;
	} );
	const luminance =
		colorChannels[ 0 ] * 0.2126 + colorChannels[ 1 ] * 0.7152 + colorChannels[ 2 ] * 0.0722;
	const singleInk = luminance > 0.179 ? '#000000' : '#ffffff';
	const [ intensity, setIntensity ] = useState< CardIntensity >( 'vibrant' );
	const [ logoPlacement, setLogoPlacement ] = useState< CardLogoPlacement >( 'signature' );
	const libraryRef = useResourceCoverHeight( design, logoPlacement );
	const fields = useMemo(
		() => createFields( applyTagFilter, design, colorBy ),
		[ applyTagFilter, design, colorBy ]
	);
	const { data, paginationInfo } = useMemo(
		() =>
			filterSortAndPaginate(
				stage === 'All'
					? sampleResources
					: sampleResources.filter( ( item ) => item.stage === stage ),
				view,
				fields
			),
		[ view, stage, fields ]
	);

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
	const resourceIndex = navigationResources.findIndex( ( item ) => item.id === resourceId );

	return (
		<div
			ref={ libraryRef }
			className="sample-resource-library resource-style-scope"
			data-card-design={ design }
			data-card-logo={ logoPlacement }
			data-card-palette={ colorBy === 'single' ? 'single' : palette }
			style={
				{
					'--resource-single-paper': singleColor,
					'--resource-single-ink': singleInk,
				} as CSSProperties
			}
			data-card-intensity={ intensity }
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
			{ designTools && (
				<TemporaryDesignSwitch
					value={ design }
					onChange={ setDesign }
					colorBy={ colorBy }
					onColorByChange={ setColorBy }
					palette={ palette }
					onPaletteChange={ ( next ) =>
						setPalettes( ( current ) => ( { ...current, [ colorBy ]: next } ) )
					}
					singleColor={ singleColor }
					onSingleColorChange={ setSingleColor }
					intensity={ intensity }
					onIntensityChange={ setIntensity }
					logoPlacement={ logoPlacement }
					onLogoPlacementChange={ setLogoPlacement }
				/>
			) }
			<DataViews< Resource >
				data={ data }
				fields={ fields }
				view={ view }
				onChangeView={ setView }
				paginationInfo={ paginationInfo }
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
							if ( ! window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches ) {
								card?.animate(
									[
										{ transform: 'scale(1)' },
										{ transform: 'scale(1.035)' },
										{ transform: 'scale(1)' },
									],
									{ duration: 120, easing: 'ease-out' }
								);
							}
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
				<DataViews.Pagination />
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
