/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */

class Reconnect extends Component {
	renderCardContent() {
		const { translate } = this.props;
		const help = translate( 'Click here to reconnect' );
		return (
			<div>
				<h3> { translate( 'Are you having problems with your connection?' ) } </h3>
				{ help }
			</div>
		);
	}

	render() {
		return <div>{ this.renderCardContent() }</div>;
	}
}

export default localize( Reconnect );
