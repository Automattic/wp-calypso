import { Link } from '@tanstack/react-router';
import { ExternalLink, __experimentalHStack as HStack } from '@wordpress/components';
import { useResizeObserver } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { titleFieldTextOverflowStyles } from '../../../sites/site-fields';
import SitePreview from '../../../sites/site-preview';
import { getSiteVisibility, getVisibilityLabels } from '../../../utils/site-visibility';
import AgencySiteIcon from '../site-icon';
import { getDisplayUrl, getSiteName, getSiteUrl } from './site-data';
import type { AgencySite, Site } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

export function getSiteIconField( viewType?: string ): Field< AgencySite > {
	const isGrid = viewType === 'grid';
	return {
		id: 'site_icon',
		label: __( 'Site icon' ),
		enableSorting: false,
		render: ( { item } ) =>
			isGrid ? (
				<HStack alignment="center" justify="center" style={ { width: '100%', height: '100%' } }>
					<AgencySiteIcon site={ item } size={ 64 } />
				</HStack>
			) : (
				<AgencySiteIcon site={ item } size={ 48 } />
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
		enableSorting: true,
		enableGlobalSearch: true,
		getValue: ( { item } ) => getSiteName( item ),
		render: ( { item } ) => (
			<Link
				to="/client-work/sites/$siteSlug"
				params={ { siteSlug: item.url } }
				style={ { color: 'inherit', textDecoration: 'none' } }
				onClick={ () => onSiteClick?.( item ) }
			>
				{ getSiteName( item ) }
			</Link>
		),
	};
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
			{ width && (
				<SitePreview
					url={ getSiteUrl( site ).replace( /\/$/, '' ) }
					scale={ width / 1200 }
					height={ 1200 }
				/>
			) }
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

// The WordPress.com "Finish setup" nag also shows for public and Pressable
// agency sites, so agency rows only show the label.
export function withoutLaunchNag( field: Field< Site > ): Field< Site > {
	return {
		...field,
		render: ( { item } ) => <>{ getVisibilityLabels()[ getSiteVisibility( item ) ] }</>,
	};
}
