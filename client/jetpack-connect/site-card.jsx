/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Site from 'blocks/site';
import CompactCard from 'components/card/compact';
import QueryUserConnection from 'components/data/query-user-connection';
import { decodeEntities } from 'lib/formatting';
import safeImageUrl from 'lib/safe-image-url';
import urlModule from 'url';

class SiteCard extends Component {
	static propTypes = {
		queryObject: PropTypes.shape( {
			site_icon: PropTypes.string,
			blogname: PropTypes.string.isRequired,
			home_url: PropTypes.string.isRequired,
			site_url: PropTypes.string.isRequired,
			client_id: PropTypes.string.isRequired,
		} ).isRequired,
		isAlreadyOnSitesList: PropTypes.bool,
	};

	render() {
		const { site_icon, blogname, home_url, site_url, client_id } = this.props.queryObject;
		const safeIconUrl = site_icon ? safeImageUrl( site_icon ) : false;
		const siteIcon = safeIconUrl ? { img: safeIconUrl } : false;
		const url = decodeEntities( home_url );
		const parsedUrl = urlModule.parse( url );
		const path = parsedUrl.path === '/' ? '' : parsedUrl.path;
		const site = {
			ID: null,
			url: url,
			admin_url: decodeEntities( site_url + '/wp-admin' ),
			domain: parsedUrl.host + path,
			icon: siteIcon,
			is_vip: false,
			title: decodeEntities( blogname ),
		};

		return (
			<CompactCard className="jetpack-connect__site">
				<QueryUserConnection
					siteId={ parseInt( client_id ) }
					siteIsOnSitesList={ this.props.isAlreadyOnSitesList }
				/>
				<Site site={ site } />
			</CompactCard>
		);
	}
}

export default SiteCard;
