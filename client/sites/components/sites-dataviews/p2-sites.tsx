import { TimeSince } from '@automattic/components';
import { SiteExcerptData } from '@automattic/sites';
import { DataViews, Field } from '@wordpress/dataviews';
import { useI18n } from '@wordpress/react-i18n';
import { useMemo } from 'react';
import { useQueryReaderTeams } from 'calypso/components/data/query-reader-teams';
import JetpackLogo from 'calypso/components/jetpack-logo';
import { Text } from 'calypso/dashboard/components/text';
import { DEFAULT_CONFIG } from 'calypso/dashboard/sites/dataviews';
import { SitePlan } from 'calypso/sites-dashboard/components/sites-site-plan';
import { getSiteDisplayUrl, getSiteDisplayName } from 'calypso/sites-dashboard/utils';
import { useSelector } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { useActions } from './actions';
import SiteField from './dataviews-fields/site-field';
import SiteIcon from './site-icon';
import { SiteStats } from './sites-site-stats';
import { SiteStatus } from './sites-site-status';
import { useSiteStatusGroups } from './use-site-status-groups';
import type { SitePreviewPane } from '../types';
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
	sitePreviewPane: SitePreviewPane;
};

const P2SitesDataViews = ( {
	sites,
	isLoading,
	paginationInfo,
	dataViewsState,
	setDataViewsState,
	sitePreviewPane,
}: Props ) => {
	const { __ } = useI18n();
	const userId = useSelector( getCurrentUserId );

	const siteStatusGroups = useSiteStatusGroups();

	useQueryReaderTeams();

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
				render: ( { item }: { item: SiteExcerptData } ) => (
					<SitePlan site={ item } userId={ userId } />
				),
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

		return dataViewFields;
	}, [ __, siteStatusGroups, sitePreviewPane, dataViewsState.type, userId ] );

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
				paginationInfo={ paginationInfo }
				getItemId={ ( item ) => {
					return item.ID.toString();
				} }
				isLoading={ isLoading }
				defaultLayouts={ { [ dataViewsState.type ]: {} } }
			/>
		</div>
	);
};

export default P2SitesDataViews;
