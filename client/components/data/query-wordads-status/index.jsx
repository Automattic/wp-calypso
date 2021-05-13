/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestWordadsStatus } from 'calypso/state/wordads/status/actions';

class QueryWordadsStatus extends Component {
	static propTypes = {
		requestWordadsStatus: PropTypes.func,
		siteId: PropTypes.number,
	};

	static defaultProps = {
		requestWordadsStatus: () => {},
	};

	componentDidMount() {
		this.props.requestWordadsStatus( this.props.siteId );
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.siteId !== prevProps.siteId ) {
			this.props.requestWordadsStatus( this.props.siteId );
		}
	}

	render() {
		return null;
	}
}

export default connect( null, { requestWordadsStatus } )( QueryWordadsStatus );
