/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import HappychatClient from 'happychat-client';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import config from 'config';
import { getCurrentUser } from 'state/current-user/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import getSkills from 'state/happychat/selectors/get-skills';
import {
	AUTH_TYPE_WPCOM_PROXY_IFRAME,
	ENTRY_CHAT,
	HAPPYCHAT_GROUP_WPCOM,
	HAPPYCHAT_SKILL_LANGUAGE,
	HAPPYCHAT_SKILL_PRODUCT,
	LAYOUT_FULLSCREEN,
	LAYOUT_PANEL,
} from './constants';

/*
 * Main chat UI component
 */
export class Happychat extends Component {
	static propTypes = {
		entry: PropTypes.string,
		layout: PropTypes.string,
		nodeId: PropTypes.string,
		skills: PropTypes.object,
		user: PropTypes.object,
	};

	static defaultProps = {
		entry: ENTRY_CHAT,
		layout: LAYOUT_PANEL,
		nodeId: 'happychat-client',
		skills: {
			[ HAPPYCHAT_SKILL_PRODUCT ]: [ HAPPYCHAT_GROUP_WPCOM ],
			[ HAPPYCHAT_SKILL_LANGUAGE ]: [ config( 'i18n_default_locale_slug' ) ],
		},
	};

	componentDidMount() {
		const { entry, layout, nodeId, skills, user } = this.props;

		// configure and open happychat
		HappychatClient.open( {
			authentication: {
				type: AUTH_TYPE_WPCOM_PROXY_IFRAME,
				options: {
					proxy: wpcom,
				},
			},
			entry,
			layout,
			nodeId,
			skills,
			user,
		} );
	}

	render() {
		const { layout } = this.props;
		return (
			<div
				id="happychat-client"
				className={ classnames( 'happychat-client__wrapper', {
					'is-fullscreen': layout === LAYOUT_FULLSCREEN,
				} ) }
			/>
		);
	}
}

const mapStateToProps = state => {
	return {
		user: getCurrentUser( state ),
		skills: getSkills( state, getSelectedSiteId( state ) ),
	};
};

const mergeProps = ( propsFromState, propsFromDispatch, ownProps ) => {
	return {
		...ownProps,
		...propsFromDispatch,
		...propsFromState,
		// use component props if we have them, otherwise default to state props
		user: ownProps.user ? ownProps.user : propsFromState.user,
		skills: ownProps.skills ? ownProps.skills : propsFromState.skills,
	};
};

export default connect( mapStateToProps, {}, mergeProps )( Happychat );
