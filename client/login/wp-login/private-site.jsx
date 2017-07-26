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

class PrivateSite extends Component {
	static propTypes = {
		redirectTo: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	render() {
		const { translate } = this.props;
		return (
			<Card>
				<div className="wp-login__private-image">
					<img src="/calypso/images/private/private.svg" />
				</div>
				<h2 className="wp-login__private-header">{ translate( 'This is a private WordPress.com site.' ) }</h2>
				<p className="wp-login__private-text">{ translate( "Request an invitation to view it and we'll " +
					'send your username to the site owner for their approval.' ) }</p>
				<Button primary={ true } className="wp-login__private-button">{ translate( 'Request Invitation' ) }</Button>
			</Card>
		);
	}
}

export default localize( PrivateSite );
