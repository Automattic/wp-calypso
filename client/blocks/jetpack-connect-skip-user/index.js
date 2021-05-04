/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { addQueryArgs } from 'calypso/lib/route';
import { urlToSlug } from 'calypso/lib/url';

/**
 * Style dependencies
 */
import './style.scss';

class JetpackConnectSkipUser extends Component {
	getPlansURL() {
		const { homeUrl, redirectAfterAuth } = this.props;
		const slug = urlToSlug( homeUrl );

		return addQueryArgs(
			{
				redirect: redirectAfterAuth,
				site: slug,
				unlinked: '1',
			},
			`https://cloud.jetpack.com/pricing/${ slug }`
		);
	}

	render() {
		const { translate } = this.props;

		return (
			<div className="jetpack-connect-skip-user__userless-form">
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
									/>
								),
							},
						}
					) }
				</p>

				<a className="jetpack-connect-skip-user__continue-link" href={ this.getPlansURL() }>
					{ translate( 'Continue without user account' ) }
				</a>
			</div>
		);
	}
}

export default localize( JetpackConnectSkipUser );
