import { Badge } from '@automattic/ui';
import { Link } from '@tanstack/react-router';
import { __experimentalHStack as HStack, __experimentalText as Text } from '@wordpress/components';
import { useResizeObserver } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import TimeSince from '../components/time-since';
import { STATUS_LABELS, getSiteStatus } from '../utils/site-status';
import { isP2 } from '../utils/site-types';
import { getFormattedWordPressVersion } from '../utils/wp-version';
import { canManageSite } from './features';
import { isSitePlanTrial } from './plans';
import {
	EngagementStat,
	LastBackup,
	MediaStorage,
	PHPVersion,
	Plan,
	Status,
	Uptime,
} from './site-fields';
import SiteIcon from './site-icon';
import SitePreview from './site-preview';
import type { Site } from '../data/types';
import type { Field, Operator } from '@automattic/dataviews';

function getSiteManagementUrl( site: Site ) {
	if ( canManageSite( site ) ) {
		return `/sites/${ site.slug }`;
	}
	return site.options?.admin_url;
}

function SiteBadge( { site }: { site: Site } ) {
	if ( site.is_wpcom_staging_site ) {
		return <Badge>{ __( 'Staging' ) }</Badge>;
	}

	if ( isSitePlanTrial( site ) ) {
		return <Badge>{ __( 'Trial' ) }</Badge>;
	}

	if ( isP2( site ) ) {
		return <Badge>{ __( 'P2' ) }</Badge>;
	}

	return null;
}

const DEFAULT_FIELDS: Field< Site >[] = [
	{
		id: 'name',
		label: __( 'Site' ),
		enableGlobalSearch: true,
		getValue: ( { item } ) => item.name || new URL( item.URL ).hostname,
		render: ( { field, item } ) => (
			<Link to={ getSiteManagementUrl( item ) } disabled={ item.is_deleted }>
				<HStack alignment="center" spacing={ 1 }>
					<Text
						as="span"
						style={ { overflowX: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }
						{ ...( item.is_deleted ? { variant: 'muted' } : {} ) }
					>
						{ field.getValue( { item } ) }
					</Text>
					<Text as="span" style={ { flexShrink: 0 } }>
						<SiteBadge site={ item } />
					</Text>
				</HStack>
			</Link>
		),
	},
	{
		id: 'URL',
		label: __( 'URL' ),
		enableGlobalSearch: true,
		getValue: ( { item } ) => new URL( item.URL ).hostname,
		render: ( { field, item } ) => (
			<Text
				as="span"
				variant="muted"
				style={ { overflowX: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }
			>
				{ field.getValue( { item } ) }
			</Text>
		),
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
		getValue: ( { item } ) => item.plan?.product_name_short ?? '',
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
		render: function PreviewRender( { item } ) {
			const [ resizeListener, { width } ] = useResizeObserver();
			const { is_deleted, is_private, URL: url } = item;
			// If the site is a private A8C site, X-Frame-Options is set to same
			// origin.
			const iframeDisabled = is_deleted || ( item.is_a8c && is_private );
			return (
				<Link
					to={ getSiteManagementUrl( item ) }
					disabled={ item.is_deleted }
					style={ { display: 'block', height: '100%', width: '100%' } }
				>
					{ resizeListener }
					{ iframeDisabled && (
						<div
							style={ {
								fontSize: '24px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								height: '100%',
							} }
						>
							<SiteIcon site={ item } />
						</div>
					) }
					{ width && ! iframeDisabled && (
						<SitePreview url={ url } scale={ width / 1200 } height={ 1200 } />
					) }
				</Link>
			);
		},
		enableSorting: false,
	},
	{
		id: 'last_published',
		label: __( 'Last published' ),
		getValue: ( { item } ) => item.options?.updated_at ?? '',
		render: ( { item } ) =>
			item.options?.updated_at ? <TimeSince date={ item.options.updated_at } /> : '',
	},
	{
		id: 'uptime',
		label: __( 'Uptime' ),
		render: ( { item } ) => <Uptime site={ item } />,
		enableSorting: false,
	},
	{
		id: 'visitors',
		label: __( 'Visitors' ),
		render: ( { item } ) => <EngagementStat site={ item } type="visitors" />,
		enableSorting: false,
	},
	{
		id: 'views',
		label: __( 'Views' ),
		render: ( { item } ) => <EngagementStat site={ item } type="views" />,
		enableSorting: false,
	},
	{
		id: 'likes',
		label: __( 'Likes' ),
		render: ( { item } ) => <EngagementStat site={ item } type="likes" />,
		enableSorting: false,
	},
	{
		id: 'php_version',
		label: __( 'PHP version' ),
		render: ( { item }: { item: Site } ) => <PHPVersion site={ item } />,
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
			const provider = item.hosting_provider_guess;
			if ( ! provider || provider === 'automattic' ) {
				return 'WordPress.com';
			}

			switch ( provider ) {
				case 'jurassic_ninja':
					return 'Jurassic Ninja';
				case 'pressable':
					return 'Pressable';
			}

			return provider;
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

		return true;
	} );
}
