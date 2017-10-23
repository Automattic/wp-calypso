/**
 * External dependencies
 *
 * @format
 */

import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import GridIcon from 'gridicons';

/**
 * Internal dependencies
 */
import config from 'config';
import { localize } from 'i18n-calypso';
import getHappychatConnectionStatus from 'state/happychat/selectors/get-happychat-connection-status';
import {
	blur,
	focus,
	openChat,
	closeChat,
	minimizeChat,
	minimizedChat,
} from 'state/happychat/ui/actions';
import { connectChat } from 'state/happychat/connect/actions';
import isHappychatMinimizing from 'state/happychat/selectors/is-happychat-minimizing';
import isHappychatConnectionUninitialized from 'state/happychat/selectors/is-happychat-connection-uninitialized';
import isHappychatOpen from 'state/happychat/selectors/is-happychat-open';
import Composer from './composer';
import Notices from './notices';
import Timeline from './timeline';

/**
 * React component for rendering title bar
 */
const Title = localize( ( { onCloseChat, translate } ) => (
	<div className="happychat__active-toolbar">
		<h4>{ translate( 'Support Chat' ) }</h4>
		<div onClick={ onCloseChat }>
			<GridIcon icon="cross" />
		</div>
	</div>
) );

/*
 * Main chat UI component
 */
class Happychat extends React.Component {
	componentDidMount() {
		if ( this.props.isEnabled && this.props.isUninitialized ) {
			this.props.connectChat();
		}
		this.props.setFocused();
	}

	componentWillUnmount() {
		this.props.setBlurred();
	}

	render() {
		const { isChatOpen, isMinimizing, onCloseChat } = this.props;

		return (
			<div className="happychat">
				<div
					className={ classnames( 'happychat__container', {
						'is-open': isChatOpen,
						'is-minimizing': isMinimizing,
					} ) }
				>
					<div className="happychat__title">
						<Title onCloseChat={ onCloseChat } />
					</div>
					<Timeline />
					<Notices />
					<Composer />
				</div>
			</div>
		);
	}
}

const mapState = state => {
	return {
		connectionStatus: getHappychatConnectionStatus( state ),
		isChatOpen: isHappychatOpen( state ),
		isEnabled: config.isEnabled( 'happychat' ),
		isMinimizing: isHappychatMinimizing( state ),
		isUninitialized: isHappychatConnectionUninitialized( state ),
	};
};

const mapDispatch = dispatch => {
	return {
		onOpenChat() {
			dispatch( openChat() );
		},
		onCloseChat() {
			dispatch( minimizeChat() );
			setTimeout( function() {
				dispatch( minimizedChat() );
				dispatch( closeChat() );
			}, 500 );
		},
		setBlurred() {
			dispatch( blur() );
		},
		setFocused() {
			dispatch( focus() );
		},
		connectChat,
	};
};

export default connect( mapState, mapDispatch )( Happychat );
