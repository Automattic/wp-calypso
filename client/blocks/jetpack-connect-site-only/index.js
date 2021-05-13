/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { addQueryArgs } from 'calypso/lib/route';
import { urlToSlug } from 'calypso/lib/url';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

/**
 * Style dependencies
 */
import './style.scss';

class JetpackConnectSiteOnly extends Component {
	static propTypes = {
		homeUrl: PropTypes.string.isRequired,
		redirectAfterAuth: PropTypes.string.isRequired,
		source: PropTypes.string,
	};

	getPlansURL() {
		const { homeUrl, redirectAfterAuth } = this.props;
		const slug = urlToSlug( homeUrl );

		// Pull the purchase nonce out of the redirect uri
		const urlParams = new URLSearchParams( window.location.search );
		const calypsoEnv = urlParams.get( 'calypso_env' );
		const redirectParams = new URLSearchParams( urlParams.get( 'redirect_to' ) );
		const purchaseNonce = redirectParams.get( 'purchase_nonce' );

		const url =
			'development' === calypsoEnv
				? `http://jetpack.cloud.localhost:3001/pricing/${ slug }`
				: `https://cloud.jetpack.com/pricing/${ slug }`;

		return addQueryArgs(
			{
				redirect: redirectAfterAuth,
				site: slug,
				unlinked: '1',
				purchaseNonce,
			},
			url
		);
	}

	getTracksProps() {
		const { source } = this.props;
		return { source };
	}

	onSkip() {
		recordTracksEvent( 'calypso_jpc_iframe_skip_user_connection', this.getTracksProps() );
	}

	onFeatures() {
		recordTracksEvent( 'calypso_jpc_iframe_view_all_features', this.getTracksProps() );
	}

	render() {
		const { translate } = this.props;

		return (
			<div className="jetpack-connect-site-only__form">
				<h2>{ translate( 'Or start using Jetpack now' ) }</h2>

				<p>{ translate( 'Jump in and start using Jetpack right away.' ) }</p>
				<p>
					{ translate(
						"{{link}}Some features{{/link}} will not be available, but you'll be able to connect your user account at any point to unlock them.",
						{
							components: {
								link: (
									<a
										target="_blank"
										href="https://jetpack.com/support/why-the-wordpress-com-connection-is-important-for-jetpack/"
										rel="noreferrer"
										onClick={ () => this.onFeatures() }
									/>
								),
							},
						}
					) }
				</p>

				<a
					className="jetpack-connect-site-only__continue-link"
					href={ this.getPlansURL() }
					onClick={ () => this.onSkip() }
				>
					{ translate( 'Continue without user account' ) }
				</a>
			</div>
		);
	}
}

export default localize( JetpackConnectSiteOnly );
