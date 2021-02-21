/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestApplicationPasswords } from 'calypso/state/application-passwords/actions';

class QueryApplicationPasswords extends Component {
	static propTypes = {
		requestApplicationPasswords: PropTypes.func,
	};

	componentDidMount() {
		this.props.requestApplicationPasswords();
	}

	render() {
		return null;
	}
}

export default connect( null, { requestApplicationPasswords } )( QueryApplicationPasswords );
