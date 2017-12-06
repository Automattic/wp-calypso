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
	static propTypes = {
		authBlogname: PropTypes.string.isRequired,
		authHomeUrl: PropTypes.string.isRequired,
		authSiteIcon: PropTypes.string,
		authSiteUrl: PropTypes.string.isRequired,
	};

	render() {
		const { authBlogname, authHomeUrl, authSiteIcon, authSiteUrl } = this.props;
		const safeIconUrl = authSiteIcon ? safeImageUrl( authSiteIcon ) : false;
		const siteIcon = safeIconUrl ? { img: safeIconUrl } : false;
		const url = decodeEntities( authHomeUrl );
		const parsedUrl = urlModule.parse( url );
		const path = parsedUrl.path === '/' ? '' : parsedUrl.path;
		const site = {
			ID: null,
			url: url,
			admin_url: decodeEntities( authSiteUrl + '/wp-admin' ),
			domain: parsedUrl.host + path,
			icon: siteIcon,
			is_vip: false,
			title: decodeEntities( authBlogname ),
		};

		return (
			<CompactCard className="jetpack-connect__site">
				<Site site={ site } />
			</CompactCard>
		);
	}
}

export default SiteCard;
