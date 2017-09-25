/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import SocialLogo from 'social-logos';

/**
 * Internal dependencies
 */
import config from 'config';
import url from 'url';

class ShareWidget extends Component {
	static propTypes = {
		text: PropTypes.string,
		title: PropTypes.string,
		urlToShare: PropTypes.string,
	}

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
				icon: 'google-plus',
				urlProperties: {
					scheme: 'https',
					hostname: 'plus.google.com',
					pathname: '/share',
					query: {
						url: urlToShare,
					}
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
					}
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
					}
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
					}
				},
			},
		];

		return (
			<ul className="share-widget__services">
				{
					services.map( ( service ) => {
						const link = url.format( service.urlProperties );
						return (
							<li className="share-widget__service" key={ service.icon }>
								<a href={ link } rel="noopener noreferrer" target="_blank">
									<SocialLogo icon={ service.icon } size={ 48 } />
								</a>
							</li>
						);
					} )
				}
			</ul>
		);
	}

	render = () => {
		const { text, title, urlToShare } = this.props;
		return (
			<div className="share-widget__container card">
				<h2>{ title }</h2>
				<p>{ text }</p>
				{ this.renderServiceIcons( urlToShare ) }
				<img src="/calypso/images/extensions/woocommerce/woocommerce-share.svg" />
			</div>
		);
	}
}

export default localize( ShareWidget );
