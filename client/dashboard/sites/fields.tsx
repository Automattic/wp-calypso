import { __ } from '@wordpress/i18n';
import TimeSince from '../components/time-since';
import { getSiteDisplayName } from '../utils/site-name';
import { getSitePlanDisplayName } from '../utils/site-plan';
import { getSiteProviderName, DEFAULT_PROVIDER_NAME } from '../utils/site-provider';
import { STATUS_LABELS, getSiteStatus } from '../utils/site-status';
import { getSiteDisplayUrl } from '../utils/site-url';
import { getFormattedWordPressVersion } from '../utils/wp-version';
import {
	EngagementStat,
	LastBackup,
	MediaStorage,
	Name,
	PHPVersion,
	Plan,
	Preview,
	Status,
	URL,
	Uptime,
	SiteIconLink,
} from './site-fields';
import type { Site } from '@automattic/api-core';
import type { Field, Operator } from '@wordpress/dataviews';

export const DEFAULT_FIELDS: Field< Site >[] = [
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
		render: ( { item } ) => <SiteIconLink site={ item } />,
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
		render: ( { item } ) => <Plan site={ item } />,
	},
	{
		id: 'status',
		label: __( 'Status' ),
		getValue: ( { item } ) => getSiteStatus( item ),
		elements: Object.entries( STATUS_LABELS ).map( ( [ value, label ] ) => ( { value, label } ) ),
		filterBy: {
			operators: [ 'is' ],
		},
		render: ( { item } ) => <Status site={ item } />,
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
		render: ( { item } ) => <EngagementStat site={ item } type="visitors" />,
		enableSorting: false,
	},
	{
		id: 'views',
		label: __( '7-day views' ),
		render: ( { item } ) => <EngagementStat site={ item } type="views" />,
		enableSorting: false,
	},
	{
		id: 'likes',
		label: __( '7-day likes' ),
		render: ( { item } ) => <EngagementStat site={ item } type="likes" />,
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

export function getFields( {
	isAutomattician,
	viewType,
}: {
	isAutomattician?: boolean;
	viewType?: string;
} ) {
	return DEFAULT_FIELDS.filter( ( field ) => {
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
}
