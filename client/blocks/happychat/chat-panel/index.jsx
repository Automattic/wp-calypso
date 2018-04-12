/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { blur, focus, closeChat, minimizeChat, minimizedChat } from 'state/happychat/ui/actions';
import { getCurrentUser } from 'state/current-user/selectors';
import isHappychatMinimizing from 'state/happychat/selectors/is-happychat-minimizing';
import isHappychatPanelHidden from 'state/happychat/selectors/is-happychat-panel-hidden';
import hasActiveHappychatSession from 'state/happychat/selectors/has-active-happychat-session';
import wasHappychatRecentlyActive from 'state/happychat/selectors/was-happychat-recently-active';
import isHappychatOpen from 'state/happychat/selectors/is-happychat-open';
import HappychatClient from 'blocks/happychat/chat-client';
import { LAYOUT_PANEL_MAX_PARENT_SIZE } from 'blocks/happychat/chat-client/constants';

/*
 * Main chat panel UI component
 */
export class HappychatPanel extends Component {
	static propTypes = {};

	static defaultProps = {};

	componentDidMount() {
		this.props.setFocused();
	}

	componentWillUnmount() {
		this.props.setBlurred();
	}

	render() {
		const {
			currentUser,
			isChatOpen,
			isChatSessionActive,
			isMinimizing,
			isPanelHidden,
			wasRecentlyActive,
		} = this.props;
		return (
			<div
				className={ classnames( 'chat-panel', {
					'is-open': isChatOpen && ! isPanelHidden,
					'is-visible': ( isChatSessionActive || wasRecentlyActive ) && ! isPanelHidden,
					'is-minimizing': isMinimizing,
				} ) }
			>
				<HappychatClient layout={ LAYOUT_PANEL_MAX_PARENT_SIZE } user={ currentUser } />
			</div>
		);
	}
}

const mapState = state => {
	return {
		currentUser: getCurrentUser( state ),
		isChatOpen: isHappychatOpen( state ),
		isPanelHidden: isHappychatPanelHidden( state ),
		isMinimizing: isHappychatMinimizing( state ),
		wasRecentlyActive: wasHappychatRecentlyActive( state ),
		isChatSessionActive: hasActiveHappychatSession( state ),
	};
};

const mapDispatch = {
	onCloseChat: closeChat,
	onMinimizeChat: minimizeChat,
	onMinimizedChat: minimizedChat,
	setBlurred: blur,
	setFocused: focus,
};

export default connect( mapState, mapDispatch )( HappychatPanel );
