import { queryClient } from '@automattic/api-queries';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import { useAuth } from '../../app/auth';
import { useAppContext } from '../../app/context';
import SiteIcon from '../../components/site-icon';
import TimeSince from '../../components/time-since';
import { getSiteDisplayName } from '../../utils/site-name';
import { getSitePlanDisplayName } from '../../utils/site-plan';
import { getSiteProviderName, DEFAULT_PROVIDER_NAME } from '../../utils/site-provider';
import { getSiteBlockingStatus } from '../../utils/site-status';
import { isSelfHostedJetpackConnected } from '../../utils/site-types';
import { getSiteDisplayUrl } from '../../utils/site-url';
import { getSiteVisibility, getVisibilityLabels } from '../../utils/site-visibility';
import { getFormattedWordPressVersion } from '../../utils/wp-version';
import {
	AsyncEngagementStat,
	LastBackup,
	MediaStorage,
	Name,
	PHPVersion,
	Plan,
	Preview,
	URL,
	Uptime,
	Visibility,
} from '../site-fields';
import type { AppConfig } from '../../app/context';
import type { Site } from '@automattic/api-core';
import type { Field, Operator, View } from '@wordpress/dataviews';

function getDefaultFields( queries: AppConfig[ 'queries' ] ): Field< Site >[] {
	const visibilityLabels = getVisibilityLabels();
	return [
		{
			id: 'name',
			label: __( 'Site' ),
			enableHiding: false,
			enableGlobalSearch: true,
			getValue: ( { item } ) => getSiteDisplayName( item ),
			render: ( { field, item } ) => <Name site={ item } value={ field.getValue( { item } ) } />,
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
			getValue: ( { item } ) => item.plan?.product_name_en ?? '',
			render: function PlanField( { item } ) {
				const { user } = useAuth();
				return (
					<Plan
						nag={ item.plan?.expired ? { isExpired: true, site: item } : { isExpired: false } }
						isSelfHostedJetpackConnected={ isSelfHostedJetpackConnected( item ) }
						isJetpack={ item.jetpack }
						isOwner={ item.site_owner === user.ID }
						value={ getSitePlanDisplayName( item ) ?? '' }
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
				const planA = getSitePlanDisplayName( a ) ?? '';
				const planB = getSitePlanDisplayName( b ) ?? '';

				return direction === 'asc' ? planA.localeCompare( planB ) : planB.localeCompare( planA );
			},
		},
		{
			id: 'visibility',
			label: __( 'Visibility' ),
			getValue: ( { item } ) => getSiteVisibility( item ),
			elements: Object.entries( visibilityLabels ).map( ( [ value, label ] ) => ( {
				value,
				label,
			} ) ),
			filterBy: {
				operators: [ 'isAny' as Operator ],
			},
			render: ( { item, field } ) => (
				<Visibility
					siteSlug={ item.slug }
					visibility={ field.getValue( { item } ) }
					status={ getSiteBlockingStatus( item ) }
					isLaunched={ item.launch_status === 'launched' || item.launch_status === false }
				/>
			),
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
			enableSorting: false,
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
		{
			id: 'is_deleted',
			type: 'boolean',
			label: __( 'Deleted' ),
			elements: [
				{ value: true, label: __( 'Yes' ) },
				{ value: false, label: __( 'No' ) },
			],
			filterBy: {
				operators: [ 'is' as Operator ],
			},
			enableHiding: false,
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

export function sanitizeFields( fields: View[ 'fields' ] ) {
	return fields?.map( ( field ) => {
		// Replace the `Status` column with `Visibility` column.
		if ( field === 'status' ) {
			return 'visibility';
		}

		return field;
	} );
}
