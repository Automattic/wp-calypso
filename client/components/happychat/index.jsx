/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import GridIcon from 'gridicons';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import {
	getHappychatConnectionStatus
} from 'state/happychat/selectors';
import {
	openChat,
	closeChat,
	minimizeChat,
	minimizedChat
} from 'state/ui/happychat/actions';
import {
	isHappychatMinimizing,
	isHappychatOpen,
} from 'state/ui/happychat/selectors';
import HappychatConnection from './connection';
import Composer from './composer';
import Notices from './notices';
import Timeline from './timeline';

/**
 * React component for rendering title bar
 */
const Title = localize( ( { onCloseChat, translate } ) => (
	<div className="happychat__active-toolbar">

		<h4>{ translate( 'Create an outstanding website!' ) }</h4>
		<h4>{ translate( 'WP.com' ) }</h4>
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
	render() {
		const {
			isChatOpen,
			isMinimizing,
			onCloseChat,
		} = this.props;

		return (
			<div className="happychat">
				<HappychatConnection />
				<div
					className={ classnames( 'happychat__container', {
						'is-open': isChatOpen,
						'is-minimizing': isMinimizing
					} ) } >
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
		isMinimizing: isHappychatMinimizing( state ),
	};
};

const mapDispatch = ( dispatch ) => {
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
	};
};

export default connect( mapState, mapDispatch )( Happychat );
