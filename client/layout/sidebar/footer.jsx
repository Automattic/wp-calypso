/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import Button from 'components/button';
import { openChat } from 'state/ui/happychat/actions';
import viewport from 'lib/viewport';
import config from 'config';

const SidebarFooter = ( { translate, children, onOpenChat } ) => (
	<div className="sidebar__footer">
		{ children }
		<Button compact borderless href="/help">
			<Gridicon icon="help-outline" /> { translate( 'Help' ) }
		</Button>
		{ config.isEnabled( 'happychat' )
			? (
			<Button className="sidebar__footer__support-chat" compact borderless onClick={ onOpenChat }>
				<svg className="gridicon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18"><path d="M16 3h-6c-1.1 0-2 .9-2 2v1h1c1.654 0 3 1.346 3 3v1h2v3l3.415-3.415c.375-.375.585-.882.585-1.412V5c0-1.1-.9-2-2-2z" /><path d="M3 7h6c1.1 0 2 .9 2 2v3c0 1.1-.9 2-2 2H5v3l-3.415-3.415C1.21 13.21 1 12.703 1 12.173V9c0-1.1.9-2 2-2z" /></svg> { translate( 'Support Chat' ) }
			</Button>
			) : null
		}
	</div>
);

const mapStateToProps = () => {
	return {};
};

const mapDispatchToProps = ( dispatch ) => {
	return {
		onOpenChat() {
			if ( viewport.isMobile() ) {
				// For mobile clients, happychat will always use the page compoent instead of the sidebar
				page( '/me/chat' );
				return;
			}
			dispatch( openChat() );
		}
	};
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( SidebarFooter ) );
