import { __experimentalHStack as HStack } from '@wordpress/components';
import { useResizeObserver } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { Text } from '../../../components/text';
import TimeSince from '../../../components/time-since';
import { Visibility } from '../../../sites/site-fields';
import { JetpackLogo } from '../../../sites/site-fields/jetpack-logo';
import SitePreview from '../../../sites/site-preview';
import { DEFAULT_PROVIDER_NAME, getSiteProviderName } from '../../../utils/site-provider';
import { getVisibilityLabels } from '../../../utils/site-visibility';
import { formatWordPressVersion } from '../../../utils/wp-version';
import { getSiteUrl } from './site-data';
import type { SiteVisibility } from '../../../types';
import type { AgencySite } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

// These fields mirror the WordPress.com sites list columns, filled from the
// agency sites endpoint so they work for every agency user. The endpoint
// can't sort by them, so sorting stays disabled.

function Unavailable() {
	return <Text variant="muted">-</Text>;
}

export function getBackupField(): Field< AgencySite > {
	return {
		id: 'backup',
		label: __( 'Backup' ),
		enableSorting: false,
		getValue: ( { item } ) => item.last_backup_time ?? '',
		render: ( { item } ) =>
			item.last_backup_time ? <TimeSince timestamp={ item.last_backup_time } /> : <Unavailable />,
	};
}

// Labels match the dotcom sites list's Jetpack product list.
function getJetpackProductLabel( slug: string ): string | null {
	if ( slug.startsWith( 'jetpack_backup' ) ) {
		return __( 'Jetpack VaultPress Backup' );
	}
	if ( slug.startsWith( 'jetpack_scan' ) ) {
		return __( 'Jetpack Scan' );
	}
	if ( slug.startsWith( 'jetpack_boost' ) ) {
		return __( 'Jetpack Boost' );
	}
	if ( slug.startsWith( 'jetpack_search' ) ) {
		return __( 'Jetpack Search' );
	}
	if ( slug.startsWith( 'jetpack_videopress' ) ) {
		return __( 'Jetpack VideoPress' );
	}
	if ( slug.startsWith( 'jetpack_anti_spam' ) || slug.startsWith( 'jetpack_akismet' ) ) {
		return __( 'Akismet Anti-spam' );
	}
	if ( slug.startsWith( 'jetpack_social' ) ) {
		return __( 'Jetpack Social' );
	}
	if ( slug.startsWith( 'jetpack_stats' ) ) {
		return __( 'Jetpack Stats' );
	}
	return null;
}

// Mirrors the dotcom display rule for Jetpack Free sites: a single paid
// product shows its name, several show "Jetpack", none shows the plan name.
function getPlanLabel( item: AgencySite ): string {
	const planName = item.plan_name ?? '';
	// Jetpack Free is the absence of a bundle: free Jetpack has no store
	// subscription, so self-hosted sites without a bundle are on it.
	const isSelfHosted = ! item.is_atomic && ! item.is_simple;
	const isJetpackFree = item.plan_slug === 'jetpack_free' || ( ! item.plan_slug && isSelfHosted );
	if ( ! isJetpackFree ) {
		return planName;
	}

	const productLabels = new Set(
		( item.active_paid_subscription_slugs ?? [] )
			.map( getJetpackProductLabel )
			.filter( ( label ): label is string => !! label )
	);
	if ( productLabels.size === 1 ) {
		return [ ...productLabels ][ 0 ];
	}
	if ( productLabels.size > 1 ) {
		return __( 'Jetpack' );
	}
	return planName || __( 'Free' );
}

export function getPlanField(): Field< AgencySite > {
	return {
		id: 'plan',
		label: __( 'Plan' ),
		enableSorting: false,
		getValue: ( { item } ) => getPlanLabel( item ),
		render: ( { field, item } ) => {
			const label = field.getValue( { item } );
			if ( ! label ) {
				return <Unavailable />;
			}
			// Match dotcom: the Jetpack logo prefixes self-hosted
			// Jetpack-connected sites only.
			if ( item.is_atomic || item.is_simple ) {
				return label;
			}
			return (
				<HStack spacing={ 1 } expanded={ false } justify="flex-start">
					<JetpackLogo size={ 16 } />
					<span>{ label }</span>
				</HStack>
			);
		},
	};
}

export function getVisibilityField(): Field< AgencySite > {
	// Mirrors the dotcom visibility rules: coming soon wins, then private,
	// then public.
	const getVisibility = ( item: AgencySite ): SiteVisibility | null => {
		const status = item.wpcom_status;
		if ( status?.is_coming_soon || ( status?.is_private && status?.is_launched === false ) ) {
			return 'coming_soon';
		}
		if ( status?.is_private ) {
			return 'private';
		}
		if ( status?.is_private === false ) {
			return 'public';
		}
		return null;
	};

	return {
		id: 'visibility',
		label: __( 'Visibility' ),
		enableSorting: false,
		getValue: ( { item } ) => {
			const visibility = getVisibility( item );
			return visibility ? getVisibilityLabels()[ visibility ] : '';
		},
		render: ( { item } ) => {
			const visibility = getVisibility( item );
			if ( ! visibility ) {
				return <Unavailable />;
			}
			return (
				<Visibility
					siteSlug={ item.url }
					visibility={ visibility }
					status={ null }
					isLaunched={ item.wpcom_status?.is_launched !== false }
				/>
			);
		},
	};
}

export function getWpVersionField(): Field< AgencySite > {
	return {
		id: 'wp_version',
		label: __( 'WP version' ),
		enableSorting: false,
		getValue: ( { item } ) => formatWordPressVersion( item.wordpress_version ?? '' ),
		render: ( { field, item } ) => field.getValue( { item } ) || <Unavailable />,
	};
}

export function getPhpVersionField(): Field< AgencySite > {
	return {
		id: 'php_version',
		label: __( 'PHP version' ),
		enableSorting: false,
		getValue: ( { item } ) => item.php_version ?? '',
		render: ( { field, item } ) => field.getValue( { item } ) || <Unavailable />,
	};
}

export function getHostField(): Field< AgencySite > {
	return {
		id: 'host',
		label: __( 'Host' ),
		enableSorting: false,
		getValue: ( { item } ) =>
			getSiteProviderName( { hosting_provider_guess: item.hosting_provider_guess } ) ??
			( item.is_atomic || item.is_simple ? DEFAULT_PROVIDER_NAME : '' ),
		render: ( { field, item } ) => field.getValue( { item } ) || <Unavailable />,
	};
}

export function getLikesField(): Field< AgencySite > {
	return {
		id: 'likes',
		label: __( '7-day likes' ),
		enableSorting: false,
		getValue: ( { item } ) => item.site_stats?.likes?.total ?? null,
		render: ( { item } ) =>
			typeof item.site_stats?.likes?.total === 'number' ? (
				item.site_stats.likes.total
			) : (
				<Unavailable />
			),
	};
}

export function getSubscribersField(): Field< AgencySite > {
	return {
		id: 'subscribers_count',
		label: __( 'Subscribers' ),
		enableSorting: false,
		getValue: ( { item } ) => item.total_wpcom_subscribers ?? null,
		render: ( { item } ) =>
			typeof item.total_wpcom_subscribers === 'number' ? (
				item.total_wpcom_subscribers
			) : (
				<Unavailable />
			),
	};
}

function Preview( { site }: { site: AgencySite } ) {
	const [ resizeListener, { width } ] = useResizeObserver();
	return (
		<div
			style={ {
				display: 'block',
				height: '100%',
				width: '100%',
				borderRadius: 'inherit',
				overflow: 'hidden',
			} }
		>
			{ resizeListener }
			{ width && <SitePreview url={ getSiteUrl( site ) } scale={ width / 1200 } height={ 1200 } /> }
		</div>
	);
}

export function getPreviewField(): Field< AgencySite > {
	return {
		id: 'preview',
		label: __( 'Preview' ),
		render: ( { item } ) => <Preview site={ item } />,
		enableHiding: false,
		enableSorting: false,
	};
}

export function getLastPublishedField(): Field< AgencySite > {
	return {
		id: 'last_published',
		label: __( 'Last published' ),
		enableSorting: false,
		getValue: ( { item } ) => item.last_publish ?? '',
		render: ( { item } ) =>
			item.last_publish ? <TimeSince timestamp={ item.last_publish } /> : <Unavailable />,
	};
}

export function getStorageField(): Field< AgencySite > {
	const getPercent = ( item: AgencySite ) => {
		const { storage_used_bytes, max_storage_bytes } = item;
		if (
			typeof storage_used_bytes !== 'number' ||
			typeof max_storage_bytes !== 'number' ||
			max_storage_bytes <= 0
		) {
			return null;
		}
		return Math.round( ( storage_used_bytes / max_storage_bytes ) * 1000 ) / 10;
	};

	return {
		id: 'storage',
		label: __( 'Storage' ),
		enableSorting: false,
		getValue: ( { item } ) => getPercent( item ),
		render: ( { item } ) => {
			const percent = getPercent( item );
			return percent === null ? <Unavailable /> : `${ percent }%`;
		},
	};
}

export function getVisitorsField(): Field< AgencySite > {
	return {
		id: 'visitors',
		label: __( '7-day visitors' ),
		enableSorting: false,
		getValue: ( { item } ) => item.site_stats?.visitors.total ?? null,
		render: ( { item } ) =>
			typeof item.site_stats?.visitors.total === 'number' ? (
				item.site_stats.visitors.total
			) : (
				<Unavailable />
			),
	};
}

export function getViewsField(): Field< AgencySite > {
	return {
		id: 'views',
		label: __( '7-day views' ),
		enableSorting: false,
		getValue: ( { item } ) => item.site_stats?.views.total ?? null,
		render: ( { item } ) =>
			typeof item.site_stats?.views.total === 'number' ? (
				item.site_stats.views.total
			) : (
				<Unavailable />
			),
	};
}
