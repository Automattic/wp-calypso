/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Happychat from 'components/happychat-client';
import { LAYOUT_FULLSCREEN } from 'components/happychat-client/constants';

/**
 * React component for rendering a happychat client as a full page
 */
export class HappychatPage extends Component {
	render() {
		return (
			<div className="chat chat__page" aria-live="polite" aria-relevant="additions">
				<Happychat layout={ LAYOUT_FULLSCREEN } />
			</div>
		);
	}
}

export default connect()( localize( HappychatPage ) );
