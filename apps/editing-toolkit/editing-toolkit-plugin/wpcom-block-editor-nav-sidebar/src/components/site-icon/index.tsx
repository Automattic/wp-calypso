/**
 * External dependencies
 */
import React from 'react';
import { useSelect } from '@wordpress/data';
import { Icon, wordpress } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import 'a8c-fse-common-data-stores';

const SITE_STORE = 'automattic/site';

export default function SiteIcon(): JSX.Element {
	const currentSiteId: number = window._currentSiteId;

	/**
	 * The site icon should be available from the `core` data store in the future,
	 * via the /wp/v2/settings endpoint, so we can avoid the additional wpcom API call.
	 *
	 * @see https://github.com/WordPress/gutenberg/pull/19967
	 */
	const siteIconUrl = useSelect(
		( select ) => {
			const siteDetails = select( SITE_STORE ).getSite( currentSiteId );
			return siteDetails?.icon?.img;
		},
		[ currentSiteId ]
	);

	if ( siteIconUrl ) {
		return (
			<>
				{ /* <span></span> */ }
				<img
					className="edit-post-fullscreen-mode-close_site-icon"
					alt={ __( 'Site Icon', 'full-site-editing' ) }
					src={ siteIconUrl }
				/>
			</>
		);
	}

	return <Icon size={ 36 } icon={ wordpress } />;
}
