/**
 * External dependencies
 */
import { Component } from 'react';
import PropTypes from 'prop-types';

export class HappychatConnection extends Component {
	componentDidMount() {
		if ( this.props.isHappychatEnabled && this.props.isConnectionUninitialized ) {
			/**
			 * @TODO: When happychat correctly handles site switching, remove manual
			 * selectSiteId action from client/my-sites/plans-features-main/index.jsx
			 */
			this.props.initConnection( this.props.getAuth() );
		}
	}

	render() {
		return null;
	}
}

HappychatConnection.propTypes = {
	getAuth: PropTypes.func,
	isConnectionUninitialized: PropTypes.bool,
	isHappychatEnabled: PropTypes.bool,
	initConnection: PropTypes.func,
};
