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
import { getCurrentUser } from 'state/current-user/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import getSkills from 'state/happychat/selectors/get-skills';

/*
 * Main chat UI component
 */
export class HappychatClient extends Component {
	static propTypes = {
		layout: PropTypes.string,
		minimized: PropTypes.bool,
		nodeId: PropTypes.string,
		skills: PropTypes.object,
		user: PropTypes.object,
	};

	static defaultProps = {
		layout: LAYOUT_PANEL_MAX_PARENT_SIZE,
		minimized: true,
		nodeId: 'happychat-client',
	};

	componentDidMount() {
		const { dispatch, layout, minimized, nodeId, skills, defaultSkills, user } = this.props;

		// configure and open happychat
		HappychatConnection( {
			dispatch,
			layout,
			minimized,
			nodeId,
			user,
			skills: skills || defaultSkills,
		} );
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

const mapState = state => {
	return {
		defaultSkills: getSkills( state, getSelectedSiteId( state ) ),
		user: getCurrentUser( state ),
	};
};

export default connect( mapState )( HappychatClient );
