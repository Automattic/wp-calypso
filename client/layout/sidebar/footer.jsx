/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import config from 'config';
import HappychatButton from 'components/happychat/button';
import hasActiveHappychatSession from 'state/happychat/selectors/has-active-happychat-session';

const SidebarFooter = ( { children, isHappychatButtonVisible } ) => (
	<div className="sidebar__footer">
		{ children }
		{ isHappychatButtonVisible &&
			config.isEnabled( 'happychat' ) && (
				<HappychatButton className="sidebar__footer-chat" allowMobileRedirect />
			) }
	</div>
);

const mapState = state => ( { isHappychatButtonVisible: hasActiveHappychatSession( state ) } );

export default connect( mapState )( localize( SidebarFooter ) );
