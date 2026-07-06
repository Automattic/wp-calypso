import { ExternalLink, __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { getAdminUrl, getDisplayUrl, getSiteName, getSiteUrl } from './site-data';
import type { AgencySite } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

// TODO: make this fallback themeable (incl. dark mode) once A4A supports dark mode.
const FALLBACK_SITE_COLOR = 'linear-gradient( 45deg, #ff0056, #ff8a78, #57b7ff, #9c00d4 )';

function AgencySiteIcon( { site, size }: { site: AgencySite; size: number } ) {
	const ico = site.icon?.img || site.icon?.ico;

	if ( ico ) {
		return (
			<img
				src={ ico }
				alt=""
				width={ size }
				height={ size }
				loading="lazy"
				style={ { borderRadius: 4, objectFit: 'cover', display: 'block' } }
			/>
		);
	}

	return (
		<span
			aria-hidden="true"
			style={ {
				display: 'block',
				width: size,
				height: size,
				borderRadius: 4,
				background: site.site_color || FALLBACK_SITE_COLOR,
			} }
		/>
	);
}

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
		// TODO: temporary raw link to wp-admin; replace with the full site-link
		// implementation once the agency site detail experience exists.
		render: ( { item } ) => (
			<a
				href={ getAdminUrl( item ) }
				target="_blank"
				rel="noreferrer"
				style={ { color: 'inherit', textDecoration: 'none' } }
				onClick={ () => onSiteClick?.( item ) }
			>
				{ getSiteName( item ) }
			</a>
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
