import { Link } from '@tanstack/react-router';
import { ExternalLink, __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import AgencySiteIcon from '../site-icon';
import { getDisplayUrl, getSiteName, getSiteUrl } from './site-data';
import type { AgencySite } from '@automattic/api-core';
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
				to="/sites/$siteSlug"
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
			<ExternalLink className="dataviews-url-field" href={ getSiteUrl( item ) }>
				{ getDisplayUrl( item ) }
			</ExternalLink>
		),
	};
}
