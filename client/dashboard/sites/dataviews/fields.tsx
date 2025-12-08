import { queryClient } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import { useAuth } from '../../app/auth';
import { useAppContext } from '../../app/context';
import SiteIcon, { SiteIconRenderer } from '../../components/site-icon';
import TimeSince from '../../components/time-since';
import { getSiteDisplayName } from '../../utils/site-name';
import { getSitePlanDisplayName, getSitePlanDisplayName__ES } from '../../utils/site-plan';
import { getSiteProviderName, DEFAULT_PROVIDER_NAME } from '../../utils/site-provider';
import { getSiteStatus, getStatusLabels } from '../../utils/site-status';
import {
	isSelfHostedJetpackConnected,
	isSelfHostedJetpackConnected__ES,
} from '../../utils/site-types';
import { getSiteDisplayUrl } from '../../utils/site-url';
import { getFormattedWordPressVersion } from '../../utils/wp-version';
import {
	AsyncEngagementStat,
	EngagementStat,
	LastBackup,
	MediaStorage,
	Name,
	NameRenderer,
	PHPVersion,
	Plan,
	Preview,
	Status,
	URL,
	Uptime,
	URLRenderer,
} from '../site-fields';
import type { AppConfig } from '../../app/context';
import type { Site, DashboardSiteListSite } from '@automattic/api-core';
import type { Field, Operator } from '@wordpress/dataviews';

function getDefaultFields( queries: AppConfig[ 'queries' ] ): Field< Site >[] {
	const statusLabels = getStatusLabels();
	return [
		{
			id: 'name',
			label: __( 'Site' ),
			enableHiding: false,
			enableGlobalSearch: true,
			getValue: ( { item } ) => getSiteDisplayName( item ),
			render: ( { field, item } ) => <Name site={ item } value={ field.getValue( { item } ) } />,
			enableSorting: ! isEnabled( 'dashboard/v2/es-site-list' ),
		},
		{
			id: 'URL',
			label: __( 'URL' ),
			enableGlobalSearch: true,
			getValue: ( { item } ) => getSiteDisplayUrl( item ),
			render: ( { field, item } ) => <URL site={ item } value={ field.getValue( { item } ) } />,
		},
		{
			id: 'icon.ico',
			label: __( 'Site icon' ),
			render: ( { item } ) => <SiteIcon site={ item } />,
			enableSorting: false,
		},
		{
			id: 'subscribers_count',
			label: __( 'Subscribers' ),
		},
		{
			id: 'backup',
			label: __( 'Backup' ),
			render: ( { item } ) => <LastBackup site={ item } />,
			enableSorting: false,
		},
		{
			id: 'plan',
			label: __( 'Plan' ),
			getValue: ( { item } ) => getSitePlanDisplayName( item ) ?? '',
			render: function PlanField( { field, item } ) {
				const { user } = useAuth();
				return (
					<Plan
						nag={ item.plan?.expired ? { isExpired: true, site: item } : { isExpired: false } }
						isSelfHostedJetpackConnected={ isSelfHostedJetpackConnected( item ) }
						isJetpack={ item.jetpack }
						isOwner={ item.site_owner === user.ID }
						value={ field.getValue( { item } ) }
					/>
				);
			},
			getElements: async () => {
				const { plan = [] } = await queryClient.ensureQueryData( {
					...queries.dashboardSiteFiltersQuery( [ 'plan' ] ),
					staleTime: 5 * 60 * 1000, // Consider valid for 5 minutes
				} );

				// A plan may have different product_slugs due to the period.
				// However, a filter can only represent one value.
				// As a result, it seems better to use the name as value for filters.
				return Array.from( new Set( plan.map( ( plan ) => plan.name ) ) ).map( ( name ) => ( {
					label: name,
					value: name,
				} ) );
			},
			filterBy: {
				operators: [ 'isAny' ],
			},
			sort: ( a, b, direction ) => {
				const planA = getSitePlanDisplayName( a ) ?? '';
				const planB = getSitePlanDisplayName( b ) ?? '';

				return direction === 'asc' ? planA.localeCompare( planB ) : planB.localeCompare( planA );
			},
		},
		{
			id: 'status',
			label: __( 'Status' ),
			getValue: ( { item } ) => getSiteStatus( item ),
			elements: Object.entries( statusLabels ).map( ( [ value, label ] ) => ( { value, label } ) ),
			filterBy: {
				operators: [ 'isAny' as Operator ],
			},
			render: function StatusField( { item } ) {
				const { user } = useAuth();
				return <Status site={ item } isOwner={ item.site_owner === user.ID } />;
			},
			enableSorting: ! isEnabled( 'dashboard/v2/es-site-list' ),
		},
		{
			id: 'wp_version',
			label: __( 'WP version' ),
			getValue: ( { item } ) => getFormattedWordPressVersion( item ),
		},
		{
			id: 'is_a8c',
			type: 'boolean',
			label: __( 'A8C owned' ),
			elements: [
				{ value: true, label: __( 'Yes' ) },
				{ value: false, label: __( 'No' ) },
			],
			filterBy: {
				operators: [ 'is' as Operator ],
			},
			render: ( { item } ) => ( item.is_a8c ? __( 'Yes' ) : __( 'No' ) ),
		},
		{
			id: 'preview',
			label: __( 'Preview' ),
			render: ( { item } ) => <Preview site={ item } />,
			enableHiding: false,
			enableSorting: false,
		},
		{
			id: 'last_published',
			label: __( 'Last published' ),
			getValue: ( { item } ) => item.options?.updated_at ?? '',
			render: ( { item } ) =>
				item.options?.updated_at ? <TimeSince timestamp={ item.options.updated_at } /> : '',
		},
		{
			id: 'uptime',
			label: __( '7-day uptime' ),
			render: ( { item } ) => <Uptime site={ item } />,
			enableSorting: false,
		},
		{
			id: 'visitors',
			label: __( '7-day visitors' ),
			render: ( { item } ) => <AsyncEngagementStat site={ item } type="visitors" />,
			enableSorting: false,
		},
		{
			id: 'views',
			label: __( '7-day views' ),
			render: ( { item } ) => <AsyncEngagementStat site={ item } type="views" />,
			enableSorting: false,
		},
		{
			id: 'likes',
			label: __( '7-day likes' ),
			render: ( { item } ) => <AsyncEngagementStat site={ item } type="likes" />,
			enableSorting: false,
		},
		{
			id: 'php_version',
			label: __( 'PHP version' ),
			render: ( { item }: { item: Site } ) => <PHPVersion site={ item } />,
			enableSorting: false,
		},
		{
			id: 'storage',
			label: __( 'Storage' ),
			render: ( { item } ) => <MediaStorage site={ item } />,
			enableSorting: false,
		},
		{
			id: 'host',
			label: __( 'Host' ),
			getValue: ( { item } ) => {
				return getSiteProviderName( item ) ?? DEFAULT_PROVIDER_NAME;
			},
			render: ( { field, item } ) => field.getValue( { item } ),
		},
	];
}

function getDefaultFields__ES( queries: AppConfig[ 'queries' ] ): Field< DashboardSiteListSite >[] {
	return [
		{
			id: 'name',
			label: __( 'Site' ),
			enableHiding: false,
			enableGlobalSearch: false, // TODO
			getValue: ( { item } ) => item.name ?? '',
			render: ( { field, item } ) => (
				<NameRenderer
					badge={ item.badge ?? null }
					muted={ item.deleted ?? false }
					value={ field.getValue( { item } ) }
				/>
			),
			enableSorting: false, // TODO
		},
		{
			id: 'URL',
			label: __( 'URL' ),
			enableGlobalSearch: true,
			getValue: ( { item } ) => item.url?.value ?? '',
			render: ( { field, item } ) => (
				<URLRenderer
					disabled={ item.deleted ?? false }
					href={ item.url?.with_scheme ?? '' }
					value={ field.getValue( { item } ) }
				/>
			),
		},
		{
			id: 'icon.ico',
			label: __( 'Site icon' ),
			render: ( { item } ) => (
				<SiteIconRenderer
					alt={ item.name ?? '' }
					fallbackInitial={ item.name?.charAt( 0 ) ?? '' }
					icon={ item.icon ?? undefined }
					isMigration={ false }
				/>
			),
			enableSorting: false,
		},
		{
			id: 'subscribers_count',
			getValue: ( { item } ) => item.total_wpcom_subscribers,
			label: __( 'Subscribers' ),
		},
		{
			id: 'plan',
			label: __( 'Plan' ),
			getValue: ( { item } ) => getSitePlanDisplayName__ES( item ),
			render: function PlanField__ES( { item, field } ) {
				const { user } = useAuth();
				return (
					<Plan
						nag={ item?.plan?.expired ? { isExpired: true, site: item } : { isExpired: false } }
						isSelfHostedJetpackConnected={ isSelfHostedJetpackConnected__ES( item ) }
						isJetpack={ !! item?.is_jetpack }
						isOwner={ item.owner_id === user.ID }
						value={ field.getValue( { item } ) }
					/>
				);
			},
			getElements: async () => {
				const { plan = [] } = await queryClient.ensureQueryData( {
					...queries.dashboardSiteFiltersQuery( [ 'plan' ] ),
					staleTime: 5 * 60 * 1000, // Consider valid for 5 minutes
				} );

				// A plan may have different product_slugs due to the period.
				// However, a filter can only represent one value.
				// As a result, it seems better to use the name as value for filters.
				return Array.from( new Set( plan.map( ( plan ) => plan.name ) ) ).map( ( name ) => ( {
					label: name,
					value: name,
				} ) );
			},
			filterBy: {
				operators: [ 'isAny' ],
			},
			sort: ( a, b, direction ) => {
				const planA = getSitePlanDisplayName__ES( a ) ?? '';
				const planB = getSitePlanDisplayName__ES( b ) ?? '';

				return direction === 'asc' ? planA.localeCompare( planB ) : planB.localeCompare( planA );
			},
		},
		{
			id: 'is_a8c',
			type: 'boolean',
			label: __( 'A8C owned' ),
			elements: [
				{ value: true, label: __( 'Yes' ) },
				{ value: false, label: __( 'No' ) },
			],
			filterBy: {
				operators: [ 'is' as Operator ],
			},
			render: ( { item } ) => ( item.is_a8c ? __( 'Yes' ) : __( 'No' ) ),
		},
		{
			id: 'visitors',
			label: __( '7-day visitors' ),
			render: ( { item, field } ) => <EngagementStat value={ field.getValue( { item } ) } />,
			enableSorting: false,
		},
	];
}

export function useFields( {
	isAutomattician,
	viewType,
}: {
	isAutomattician?: boolean;
	viewType?: string;
} ) {
	const { queries } = useAppContext();

	return useMemo( () => {
		const defaultFields = getDefaultFields( queries );
		return defaultFields.filter( ( field ) => {
			if ( field.id === 'is_a8c' && ! isAutomattician ) {
				return false;
			}

			if ( field.id === 'icon.ico' && viewType === 'grid' ) {
				return false;
			}

			if ( field.id === 'preview' && viewType === 'table' ) {
				return false;
			}

			return true;
		} );
	}, [ isAutomattician, viewType, queries ] );
}

export function useFields__ES( {
	isAutomattician,
	viewType,
}: {
	isAutomattician?: boolean;
	viewType?: string;
} ) {
	const { queries } = useAppContext();

	return useMemo( () => {
		const defaultFields = getDefaultFields__ES( queries );
		return defaultFields.filter( ( field ) => {
			if ( field.id === 'is_a8c' && ! isAutomattician ) {
				return false;
			}

			if ( field.id === 'icon.ico' && viewType === 'grid' ) {
				return false;
			}

			if ( field.id === 'preview' && viewType === 'table' ) {
				return false;
			}

			return true;
		} );
	}, [ isAutomattician, viewType, queries ] );
}
