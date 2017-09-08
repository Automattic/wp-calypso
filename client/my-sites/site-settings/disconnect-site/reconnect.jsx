/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';

class Reconnect extends Component {
	renderCardContent() {
		const { translate } = this.props;

		return (
			<Card>
				<h3>
					{' '}
					{ translate( 'Reconnection' ) }{' '}
				</h3>
				{ " This is temporary -- I'm troubleshooting a problem." }
			</Card>
		);
	}

	render() {
		return (
			<div>
				{ this.renderCardContent() }
			</div>
		);
	}
}

export default localize( Reconnect );
