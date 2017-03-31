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
import { connectChat } from 'state/happychat/actions';
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
import Notices from './notices';
import Timeline from './timeline';
import Composer from './composer';
import { localize } from 'i18n-calypso';

/**
 * Function for rendering correct titlebar based on happychat client state
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
const Happychat = React.createClass( {

	componentDidMount() {
		this.props.connectChat();
	},

	render() {
		const {
			isMinimizing,
			onCloseChat,
			isChatOpen,
		} = this.props;

		return (
			<div className="happychat">
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
} );

const mapState = state => {
	return {
		connectionStatus: getHappychatConnectionStatus( state ),
		isMinimizing: isHappychatMinimizing( state ),
		isChatOpen: isHappychatOpen( state ),
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
		connectChat() {
			dispatch( connectChat() );
		}
	};
};

/*
 * Export redux connected component
 */
export default connect( mapState, mapDispatch )( Happychat );
