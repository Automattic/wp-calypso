/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { blur, focus, closeChat, minimizeChat, minimizedChat } from 'state/happychat/ui/actions';
import isHappychatMinimizing from 'state/happychat/selectors/is-happychat-minimizing';
import isHappychatOpen from 'state/happychat/selectors/is-happychat-open';
import HappychatConnection from './connection';
import Title from './title';
import Composer from './composer';
import Notices from './notices';
import Timeline from './timeline';

/*
 * Main chat UI component
 */
export class Happychat extends Component {
	componentDidMount() {
		this.props.setFocused();
	}

	componentWillUnmount() {
		this.props.setBlurred();
	}

	// transform-class-properties syntax so this is bound within the function
	onCloseChatTitle = () => {
		const { onMinimizeChat, onMinimizedChat, onCloseChat } = this.props;
		onMinimizeChat();
		setTimeout( () => {
			onMinimizedChat();
			onCloseChat();
		}, 500 );
	};

	render() {
		const { isChatOpen, isMinimizing } = this.props;

		return (
			<div className="happychat">
				<HappychatConnection />
				<div
					className={ classnames( 'happychat__container', {
						'is-open': isChatOpen,
						'is-minimizing': isMinimizing,
					} ) }
				>
					<Title onCloseChat={ this.onCloseChatTitle } />
					<Timeline />
					<Notices />
					<Composer />
				</div>
			</div>
		);
	}
}

Happychat.propTypes = {
	isChatOpen: PropTypes.bool,
	isMinimizing: PropTypes.bool,
	onCloseChat: PropTypes.func,
	onMinimizeChat: PropTypes.func,
	onMinimizedChat: PropTypes.func,
	setBlurred: PropTypes.func,
	setFocused: PropTypes.func,
};

const mapState = state => {
	return {
		isChatOpen: isHappychatOpen( state ),
		isMinimizing: isHappychatMinimizing( state ),
	};
};

const mapDispatch = dispatch => {
	return {
		onCloseChat() {
			dispatch( closeChat() );
		},
		onMinimizeChat() {
			dispatch( minimizeChat() );
		},
		onMinimizedChat() {
			dispatch( minimizedChat() );
		},
		setBlurred() {
			dispatch( blur() );
		},
		setFocused() {
			dispatch( focus() );
		},
	};
};

export default connect( mapState, mapDispatch )( Happychat );
