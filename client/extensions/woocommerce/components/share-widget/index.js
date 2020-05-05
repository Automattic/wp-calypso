/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import config from 'config';
import { localize } from 'i18n-calypso';
import url from 'url';

/**
 * Internal dependencies
 */
import DashboardWidget from 'woocommerce/components/dashboard-widget';
import SocialLogo from 'components/social-logo';

class ShareWidget extends Component {
	static propTypes = {
		text: PropTypes.string,
		title: PropTypes.string,
		urlToShare: PropTypes.string,
	};

	renderServiceIcons = () => {
		const { translate, urlToShare } = this.props;
		const services = [
			{
				icon: 'facebook',
				urlProperties: {
					scheme: 'https',
					hostname: 'www.facebook.com',
					pathname: '/sharer.php',
					query: {
						u: urlToShare,
						app_id: config( 'facebook_api_key' ),
					},
				},
			},
			{
				icon: 'twitter',
				urlProperties: {
					scheme: 'https',
					hostname: 'twitter.com',
					pathname: '/intent/tweet',
					query: {
						text: translate( 'Come check out our store!' ),
						url: urlToShare,
						via: 'wordpressdotcom',
					},
				},
			},
			{
				icon: 'linkedin',
				urlProperties: {
					scheme: 'https',
					hostname: 'www.linkedin.com',
					pathname: 'shareArticle',
					query: {
						url: urlToShare,
						mini: 'true',
					},
				},
			},
			{
				icon: 'tumblr',
				urlProperties: {
					scheme: 'https',
					hostname: 'www.tumblr.com',
					pathname: 'widgets/share/tool/preview',
					query: {
						_format: 'html',
						posttype: 'link',
						shareSource: 'legacy',
						url: urlToShare,
					},
				},
			},
			{
				icon: 'pinterest',
				urlProperties: {
					scheme: 'https',
					hostname: 'www.pinterest.com',
					pathname: 'pin/create/button',
					query: {
						url: urlToShare,
					},
				},
			},
		];

		return (
			<ul className="share-widget__services">
				{ services.map( ( service ) => {
					const link = url.format( service.urlProperties );
					return (
						<li className="share-widget__service" key={ service.icon }>
							<a href={ link } rel="noopener noreferrer" target="_blank">
								<SocialLogo icon={ service.icon } size={ 48 } />
							</a>
						</li>
					);
				} ) }
			</ul>
		);
	};

	render() {
		const { text, title, urlToShare } = this.props;
		// just `share-widget` gets blocked by ad-blockers
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<DashboardWidget
				className="share-widget__container"
				title={ title }
				image="/calypso/images/extensions/woocommerce/woocommerce-share.svg"
				imagePosition="bottom"
				imageFlush
			>
				<p>{ text }</p>
				{ this.renderServiceIcons( urlToShare ) }
			</DashboardWidget>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default localize( ShareWidget );
