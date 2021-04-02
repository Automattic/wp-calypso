/**
 * External dependencies
 */
import React from 'react';
import { useSelect } from '@wordpress/data';
import { Icon, wordpress } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';

export default function SiteIcon(): JSX.Element {
	const currentSiteId: number = window._currentSiteId;

	// The site icon url should be available from /wp/v2/settings or similar in the future,
	// but for now it's accessible at the index endpoint.
	// https://github.com/WordPress/gutenberg/blob/68c3978be352c6d3982f73bcf8c80744608c53c8/lib/init.php#L160
	const siteIconUrl = useSelect(
		( select ) => {
			const { getEntityRecord } = select( 'core' );
			const siteData = getEntityRecord( 'root', '__unstableBase', undefined ) || {};
			return siteData.site_icon_url;
		},
		[ currentSiteId ]
	);

	if ( siteIconUrl ) {
		return (
			<img
				className="edit-post-fullscreen-mode-close_site-icon"
				alt={ __( 'Site Icon', 'full-site-editing' ) }
				src={ siteIconUrl }
			/>
		);
	}

	return <Icon size={ 36 } icon={ wordpress } />;
}
