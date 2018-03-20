/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import config from 'config';
import HappychatButton from 'components/happychat/button';
import hasActiveHappychatSession from 'state/happychat/selectors/has-active-happychat-session';

class SidebarFooter extends Component {
	render() {
		if ( ! this.props.children && ! this.props.isHappychatButtonVisible ) {
			return null;
		}
		return (
			<div className="sidebar__footer">
				{ this.props.children }
				{ this.props.isHappychatButtonVisible &&
					config.isEnabled( 'happychat' ) && (
						<HappychatButton className="sidebar__footer-chat" allowMobileRedirect />
					) }
			</div>
		);
	}
}

const mapState = state => ( { isHappychatButtonVisible: hasActiveHappychatSession( state ) } );

export default connect( mapState )( localize( SidebarFooter ) );
