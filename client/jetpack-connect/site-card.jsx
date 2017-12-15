/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import urlModule from 'url';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import Site from 'blocks/site';
import safeImageUrl from 'lib/safe-image-url';
import { decodeEntities } from 'lib/formatting';

class SiteCard extends Component {
	static propTypes = { authQuery: PropTypes.object.isRequired };

	render() {
		const { blogname, homeUrl, siteIcon, siteUrl } = this.props.authQuery;
		const safeIconUrl = siteIcon ? safeImageUrl( siteIcon ) : false;
		const icon = safeIconUrl ? { img: safeIconUrl } : false;
		const url = decodeEntities( homeUrl );
		const parsedUrl = urlModule.parse( url );
		const path = parsedUrl.path === '/' ? '' : parsedUrl.path;
		const site = {
			admin_url: decodeEntities( siteUrl + '/wp-admin' ),
			domain: parsedUrl.host + path,
			icon,
			ID: null,
			is_vip: false,
			title: decodeEntities( blogname ),
			url: url,
		};

		return (
			<CompactCard className="jetpack-connect__site">
				<Site site={ site } />
			</CompactCard>
		);
	}
}

export default SiteCard;
