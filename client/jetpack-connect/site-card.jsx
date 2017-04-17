/**
 * External dependencies
 */
import React from 'react';
import urlModule from 'url';

/**
 * Internal dependencies
 */
import QuerySites from 'components/data/query-sites';
import CompactCard from 'components/card/compact';
import Site from 'blocks/site';
import { decodeEntities } from 'lib/formatting';
import safeImageUrl from 'lib/safe-image-url';

export default function SiteCard( props ) {
	const { site_icon, blogname, home_url, site_url } = props.queryObject;
	const safeIconUrl = site_icon ? safeImageUrl( site_icon ) : false;
	const siteIcon = safeIconUrl ? { img: safeIconUrl } : false;
	const url = decodeEntities( home_url );
	const parsedUrl = urlModule.parse( url );
	const path = ( parsedUrl.path === '/' ) ? '' : parsedUrl.path;
	const site = {
		ID: null,
		url: url,
		admin_url: decodeEntities( site_url + '/wp-admin' ),
		domain: parsedUrl.host + path,
		icon: siteIcon,
		is_vip: false,
		title: decodeEntities( blogname )
	};

	return (
		<CompactCard className="jetpack-connect__site">
			<QuerySites allSites />
			<Site site={ site } />
		</CompactCard>
	);
}
