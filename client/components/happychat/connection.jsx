/** @format */

/**
 * External dependencies
 */
import { Component } from 'react';
import PropTypes from 'prop-types';

export class HappychatConnection extends Component {
	componentDidMount() {
		if ( this.props.isHappychatEnabled && this.props.isConnectionUninitialized ) {
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
