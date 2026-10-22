import { Link } from '@tanstack/react-router';
import { ExternalLink, __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import { useInView } from 'react-intersection-observer';
import { titleFieldTextOverflowStyles } from '../../../sites/site-fields';
import { useIsSiteUnreachable } from '../../../sites/site-fields/site-unreachable-status';
import { getSiteVisibility, getVisibilityLabels } from '../../../utils/site-visibility';
import SiteScreenshot from '../../amplify/site-screenshot';
import '../site-thumbnail.scss';
import { getDisplayUrl, getSiteName, getSiteUrl } from './site-data';
import type { AgencySite, Site } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

export function getSiteIconField( viewType?: string ): Field< AgencySite > {
	return {
		id: 'site_icon',
		label: __( 'Site preview' ),
		enableSorting: false,
		render: ( { item } ) => (
			<div className="agency-site-thumbnail" data-grid={ viewType === 'grid' }>
				<SiteScreenshot
					key={ getSiteUrl( item ) }
					url={ getSiteUrl( item ) }
					alt=""
					compact
					decorative
				/>
			</div>
		),
	};
}

export function getSiteNameField(
	onSiteClick?: ( site: AgencySite ) => void
): Field< AgencySite > {
	return {
		id: 'name',
		label: __( 'Site' ),
		enableHiding: false,
		// The agency endpoint only sorts by URL.
		enableSorting: false,
		enableGlobalSearch: true,
		getValue: ( { item } ) => getSiteName( item ),
		render: ( { item } ) => <Name site={ item } onSiteClick={ onSiteClick } />,
	};
}

function Name( {
	site,
	onSiteClick,
}: {
	site: AgencySite;
	onSiteClick?: ( site: AgencySite ) => void;
} ) {
	const { ref, inView } = useInView( { triggerOnce: true, fallbackInView: true } );
	const isUnreachable = useIsSiteUnreachable(
		{ ID: site.blog_id, jetpack: ! site.is_simple, is_deleted: false },
		inView
	);

	return (
		<HStack ref={ ref } justify="flex-start" alignment="center" spacing={ 1 } expanded={ false }>
			<Link
				to="/sites/$siteSlug"
				params={ { siteSlug: site.url } }
				style={ { color: 'inherit', textDecoration: 'none', ...titleFieldTextOverflowStyles } }
				onClick={ () => onSiteClick?.( site ) }
			>
				{ getSiteName( site ) }
			</Link>
			{ site.a4a_is_dev_site && (
				<span style={ { flexShrink: 0 } }>
					<Badge intent="draft">{ __( 'Development' ) }</Badge>
				</span>
			) }
			{ isUnreachable && (
				<span style={ { flexShrink: 0 } }>
					<Badge intent="high">{ __( 'Unreachable' ) }</Badge>
				</span>
			) }
		</HStack>
	);
}

export function getSiteUrlField(): Field< AgencySite > {
	return {
		id: 'URL',
		label: __( 'URL' ),
		enableSorting: true,
		enableGlobalSearch: true,
		getValue: ( { item } ) => getDisplayUrl( item ),
		render: ( { item } ) => (
			<ExternalLink
				className="dataviews-url-field"
				style={ titleFieldTextOverflowStyles }
				href={ getSiteUrl( item ) }
			>
				{ getDisplayUrl( item ) }
			</ExternalLink>
		),
	};
}

export function getPreviewField(): Field< AgencySite > {
	return {
		id: 'preview',
		label: __( 'Preview' ),
		render: ( { item } ) => (
			<div className="agency-site-thumbnail" data-grid="true">
				<SiteScreenshot key={ getSiteUrl( item ) } url={ getSiteUrl( item ) } alt="" decorative />
			</div>
		),
		enableHiding: false,
		enableSorting: false,
	};
}

// The WordPress.com "Finish setup" nag also shows for public and Pressable
// agency sites, so agency rows only show the label.
export function withoutLaunchNag( field: Field< Site > ): Field< Site > {
	return {
		...field,
		render: ( { item } ) => <>{ getVisibilityLabels()[ getSiteVisibility( item ) ] }</>,
	};
}
