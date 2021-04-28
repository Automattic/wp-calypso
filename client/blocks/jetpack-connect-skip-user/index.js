/**
 * External dependencies
 */
import React, { Component } from 'react';

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
			},
			`https://cloud.jetpack.com/pricing/${ slug }`
		);
	}

	render() {
		return (
			<div className="jetpack-connect-skip-user__userless-form">
				<h2>Or start using Jetpack now</h2>

				<p>Jump in and start using Jetpack right away.</p>
				<p>
					<a target="_blank" href="https://jetpack.com/support/features/" rel="noreferrer">
						Some features
					</a>
					&nbsp;will not be available, but you'll be able to connect your user account at any point
					to unlock them.
				</p>

				<a className="jetpack-connect-skip-user__continue-link" href={ this.getPlansURL() }>
					Continue without user account
				</a>
			</div>
		);
	}
}

export default JetpackConnectSkipUser;
