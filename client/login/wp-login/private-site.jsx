/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import { addSchemeIfMissing } from 'lib/url';

class PrivateSite extends Component {
	static propTypes = {
		translate: PropTypes.func.isRequired,
	};

	render() {
		const { translate, site } = this.props;

		return (
			<Card className="wp-login__private-site">
				<div className="wp-login__private-site-image">
					<img src="/calypso/images/private/private.svg" />
				</div>

				<h2 className="wp-login__private-site-header">
					{ translate( 'The site %(site)s is a private WordPress.com site.', {
						args: {
							site: addSchemeIfMissing( site, 'https' )
						}
					} ) }
				</h2>

				<p>
					{ translate( "Request an invitation to view it and we'll " +
						'send your username to the site owner for their approval.' ) }
				</p>

				<Button primary className="wp-login__private-site-button">
					{ translate( 'Request Invitation' ) }
				</Button>
			</Card>
		);
	}
}

export default localize( PrivateSite );
