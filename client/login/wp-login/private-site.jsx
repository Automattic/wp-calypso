/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';

class PrivateSite extends Component {
	static propTypes = {
		translate: PropTypes.func.isRequired,
	};

	render() {
		const { translate } = this.props;

		return (
			<Card className="wp-login__private-site">
				<div className="wp-login__private-site-image">
					<img src="/calypso/images/private/private.svg" />
				</div>

				<h2 className="wp-login__private-site-header">
					{ translate( 'This is a private WordPress.com site.' ) }
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
