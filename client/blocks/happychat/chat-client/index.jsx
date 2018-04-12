/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import includes from 'lodash/includes';

/**
 * Internal dependencies
 */
import HappychatConnection from 'blocks/happychat/connection';
import { LAYOUT_PANEL_MAX_PARENT_SIZE, LAYOUT_MAX_PARENT_SIZE } from './constants';

/*
 * Main chat UI component
 */
export class HappychatClient extends Component {
	static propTypes = {
		layout: PropTypes.string,
		minimized: PropTypes.bool,
		nodeId: PropTypes.string,
		skills: PropTypes.object,
	};

	static defaultProps = {
		layout: LAYOUT_PANEL_MAX_PARENT_SIZE,
		minimized: true,
		nodeId: 'happychat-client',
	};

	componentDidMount() {
		const { dispatch, layout, minimized, nodeId, skills, state } = this.props;

		// configure and open happychat
		HappychatConnection(
			{ state, dispatch },
			{
				nodeId,
				layout,
				minimized,
				skills,
			}
		);
	}

	render() {
		const { layout } = this.props;
		return (
			<div
				id="happychat-client"
				className={ classnames( 'chat-client', {
					'is-fullscreen': includes(
						[ LAYOUT_MAX_PARENT_SIZE, LAYOUT_PANEL_MAX_PARENT_SIZE ],
						layout
					),
				} ) }
			/>
		);
	}
}

const mapState = state => ( { state } );

export default connect( mapState )( HappychatClient );
