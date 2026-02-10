import { queryClient, dashboardSiteFiltersQuery } from '@automattic/api-queries';
import { TimeSince } from '@automattic/components';
import { SiteExcerptData } from '@automattic/sites';
import { DataViews, Field } from '@wordpress/dataviews';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback, useMemo } from 'react';
import { useQueryReaderTeams } from 'calypso/components/data/query-reader-teams';
import JetpackLogo from 'calypso/components/jetpack-logo';
import { Text } from 'calypso/dashboard/components/text';
import { DEFAULT_CONFIG } from 'calypso/dashboard/sites/dataviews';
import { DEFAULT_PROVIDER_NAME, getSiteProviderName } from 'calypso/dashboard/utils/site-provider';
import { formatWordPressVersion } from 'calypso/dashboard/utils/wp-version';
import { navigate } from 'calypso/lib/navigate';
import { SitePlan } from 'calypso/sites-dashboard/components/sites-site-plan';
import {
	isSitePreviewPaneEligible,
	getSiteDisplayUrl,
	getSiteDisplayName,
} from 'calypso/sites-dashboard/utils';
import { useSelector, useStore } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { isA8cTeamMember } from 'calypso/state/teams/selectors';
import { useActions } from './actions';
import SiteField from './dataviews-fields/site-field';
import SiteIcon from './site-icon';
import { SiteStats } from './sites-site-stats';
import { SiteStatus } from './sites-site-status';
import type { View } from '@wordpress/dataviews';
import './style.scss';
import './dataview-style.scss';

type Props = {
	sites: SiteExcerptData[];
	siteType: 'p2' | 'non-p2';
	isLoading: boolean;
	paginationInfo: { totalItems: number; totalPages: number };
	dataViewsState: View;
	setDataViewsState: ( callback: ( prevState: View ) => View ) => void;
	selectedItem: SiteExcerptData | null | undefined;
} & Pick< React.ComponentProps< typeof SiteField >, 'sitePreviewPane' >;

export function useSiteStatusGroups() {
	const { __ } = useI18n();

	return useMemo(
		() => [
			{ value: 1, label: __( 'All sites' ), slug: 'all' },
			{ value: 2, label: __( 'Public' ), slug: 'public' },
			{ value: 3, label: __( 'Private' ), slug: 'private' },
			{ value: 4, label: __( 'Coming soon' ), slug: 'coming-soon' },
			{ value: 5, label: __( 'Redirect' ), slug: 'redirect' },
			{ value: 6, label: __( 'Deleted' ), slug: 'deleted' },
		],
		[ __ ]
	);
}

const DotcomSitesDataViews = ( {
	sites,
	siteType,
	isLoading,
	paginationInfo,
	dataViewsState,
	setDataViewsState,
	selectedItem,
	sitePreviewPane,
}: Props ) => {
	const { __ } = useI18n();
	const store = useStore();
	const userId = useSelector( getCurrentUserId );

	// By default, DataViews is in an "uncontrolled" mode, meaning the current selection is handled internally.
	// However, each time a site is selected, the URL changes, so, the component is remounted and the current selection is lost.
	// To prevent that, we want to use DataViews in "controlled" mode, so that we can pass an initial selection during initial mount.
	//
	// To do that, we need to pass a required `onSelectionChange` callback to signal that it is being used in controlled mode.
	// The current selection is a derived value which is [selectedItem.ID] (see `selection`).
	const onSelectionChange = useCallback(
		( selectedSiteIds: string[] ) => {
			// In table view, when a row is clicked, the item is selected for a bulk action, so the panel should not open.
			if ( dataViewsState.type !== 'list' ) {
				return;
			}
			if ( selectedSiteIds.length === 0 ) {
				return;
			}

			const site = sites.find( ( s ) => s.ID === Number( selectedSiteIds[ 0 ] ) );
			if ( site && ! site.is_deleted ) {
				const canManageOptions = canCurrentUser( store.getState(), site.ID, 'manage_options' );
				if ( isSitePreviewPaneEligible( site, canManageOptions ) ) {
					sitePreviewPane.open( site, 'list_row_click' );
					return;
				}

				navigate( site.options?.admin_url || '' );
			}
		},
		[ dataViewsState.type, sitePreviewPane, sites, store ]
	);

	const selection = selectedItem ? [ selectedItem.ID.toString() ] : undefined;

	const siteStatusGroups = useSiteStatusGroups();

	useQueryReaderTeams();
	const isAutomattician = useSelector( isA8cTeamMember );

	// Generate DataViews table field-columns
	const fields = useMemo( () => {
		const dataViewFields: Field< SiteExcerptData >[] = [
			{
				id: 'icon.ico',
				label: __( 'Site icon' ),
				render: ( { item }: { item: SiteExcerptData } ) => {
					return (
						<SiteIcon
							site={ item }
							openSitePreviewPane={ sitePreviewPane.open }
							viewType={ dataViewsState.type }
						/>
					);
				},
				enableHiding: false,
				enableSorting: false,
				enableGlobalSearch: false,
			},
			{
				id: 'name',
				label: __( 'Site' ),
				getValue: ( { item } ) => getSiteDisplayName( item ),
				render: ( { item }: { item: SiteExcerptData } ) => {
					return <SiteField site={ item } sitePreviewPane={ sitePreviewPane } />;
				},
				enableHiding: false,
				enableSorting: true,
			},
			{
				id: 'URL',
				label: __( 'URL' ),
				enableGlobalSearch: true,
				getValue: ( { item } ) => getSiteDisplayUrl( item ),
				render: ( { field, item } ) => (
					<Text variant="muted" truncate numberOfLines={ 1 } style={ { marginInlineEnd: '24px' } }>
						{ field.getValue( { item } ) }
					</Text>
				),
			},
			{
				id: 'plan',
				label: __( 'Plan' ),
				getValue: ( { item } ) => item.plan?.product_name_en ?? '',
				render: ( { item }: { item: SiteExcerptData } ) => (
					<SitePlan site={ item } userId={ userId } />
				),
				getElements: async () => {
					const { plan = [] } = await queryClient.ensureQueryData( {
						...dashboardSiteFiltersQuery( 'all', [ 'plan' ] ),
						staleTime: 5 * 60 * 1000, // Consider valid for 5 minutes
					} );

					// A plan may have different product_slugs due to the period.
					// However, a filter can only represent one value.
					// As a result, it seems better to use the untranslated name as value for filters.
					const elements = plan.reduce(
						( acc, current ) => ( {
							...acc,
							[ current.name ]: current.name_en,
						} ),
						{}
					);

					return Object.entries( elements ).map( ( [ label, value ] ) => ( {
						label,
						value,
					} ) );
				},
				filterBy: {
					operators: [ 'isAny' ],
				},
				sort: ( a, b, direction ) => {
					const planA = a.plan?.product_name_en ?? '';
					const planB = b.plan?.product_name_en ?? '';

					return direction === 'asc' ? planA.localeCompare( planB ) : planB.localeCompare( planA );
				},
				enableHiding: false,
				enableSorting: true,
			},
			{
				id: 'last-publish',
				label: __( 'Last published' ),
				render: ( { item }: { item: SiteExcerptData } ) =>
					item.options?.updated_at ? <TimeSince date={ item.options.updated_at } /> : '',
				enableHiding: false,
				enableSorting: true,
			},
		];

		if ( siteType === 'non-p2' ) {
			const extraFields: Field< SiteExcerptData >[] = [
				{
					id: 'subscribers_count',
					label: __( 'Subscribers' ),
				},
				{
					id: 'visibility',
					label: __( 'Visibility' ),
					getValue: ( { item } ) => {
						if (
							item.is_coming_soon ||
							( item.is_private && item.launch_status === 'unlaunched' )
						) {
							return 'coming_soon';
						}

						if ( item.is_private ) {
							return 'private';
						}

						return 'public';
					},
					elements: [
						{
							label: __( 'Public' ),
							value: 'public',
						},
						{
							label: __( 'Private' ),
							value: 'private',
						},
						{
							label: __( 'Coming soon' ),
							value: 'coming_soon',
						},
					],
					filterBy: {
						operators: [ 'isAny' ],
					},
					enableHiding: false,
				},
				{
					id: 'wp_version',
					label: __( 'WP version' ),
					getValue: ( { item } ) => formatWordPressVersion( item.options?.software_version ?? '' ),
					enableHiding: false,
				},
				{
					id: 'host',
					label: __( 'Host' ),
					getValue: ( { item } ) => {
						return getSiteProviderName( item ) ?? DEFAULT_PROVIDER_NAME;
					},
					render: ( { field, item } ) => field.getValue( { item } ),
					enableHiding: false,
				},
				{
					id: 'is_deleted',
					type: 'boolean',
					label: __( 'Deleted' ),
					elements: [
						{ value: true, label: __( 'Yes' ) },
						{ value: false, label: __( 'No' ) },
					],
					filterBy: {
						operators: [ 'is' ],
					},
					enableHiding: false,
					enableSorting: false,
				},
			];

			if ( isAutomattician ) {
				extraFields.push( {
					id: 'is_a8c',
					label: __( 'A8C owned' ),
					elements: [
						{ value: true, label: __( 'Yes' ) },
						{ value: false, label: __( 'No' ) },
					],
					filterBy: {
						operators: [ 'is' ],
					},
					enableHiding: false,
					enableSorting: false,
				} );
			}

			return [ ...dataViewFields, ...extraFields ];
		}

		return [
			...dataViewFields,
			{
				id: 'status',
				label: __( 'Status' ),
				render: ( { item }: { item: SiteExcerptData } ) => <SiteStatus site={ item } />,
				enableHiding: false,
				enableSorting: true,
				elements: siteStatusGroups,
				filterBy: {
					operators: [ 'is' ],
				},
			},
			{
				id: 'stats',
				label: __( 'Stats' ),
				header: (
					<span className="sites-dataviews__stats-label">
						<JetpackLogo size={ 16 } />
						{ __( 'Stats' ) }
					</span>
				),
				render: ( { item }: { item: SiteExcerptData } ) => <SiteStats site={ item } />,
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'last-interacted',
				label: __( 'Last interacted' ),
				render: () => null,
				enableHiding: false,
				enableSorting: true,
				getValue: () => null,
			},
		];
	}, [
		__,
		siteStatusGroups,
		sitePreviewPane,
		dataViewsState.type,
		userId,
		isAutomattician,
		siteType,
	] );

	const actions = useActions( {
		viewType: dataViewsState.type,
	} );

	return (
		<div className="sites-dataviews">
			<DataViews
				data={ sites }
				fields={ fields }
				onChangeView={ ( newView ) => setDataViewsState( () => newView ) }
				view={ dataViewsState }
				config={ DEFAULT_CONFIG }
				actions={ actions }
				search
				searchLabel={ __( 'Search sites…' ) }
				selection={ selection }
				paginationInfo={ paginationInfo }
				getItemId={ ( item ) => {
					return item.ID.toString();
				} }
				isLoading={ isLoading }
				defaultLayouts={ { [ dataViewsState.type ]: {} } }
				onChangeSelection={ onSelectionChange }
			/>
		</div>
	);
};

export default DotcomSitesDataViews;
