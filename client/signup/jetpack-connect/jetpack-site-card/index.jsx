/**
 * External dependencies
 */
import React from 'react';
import urlModule from 'url';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import safeImageUrl from 'lib/safe-image-url';
import { decodeEntities } from 'lib/formatting';
import QuerySites from 'components/data/query-sites';
import Site from 'blocks/site';

const JetpackSiteCard = ( { site_icon, blogname, home_url, site_url } ) => {
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
		<CompactCard className="jetpack-site-card">
			<QuerySites allSites />
			<Site site={ site } />
		</CompactCard>
	);
};

export default JetpackSiteCard;

