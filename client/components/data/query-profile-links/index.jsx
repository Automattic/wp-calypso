/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestUserProfileLinks } from 'calypso/state/profile-links/actions';

class QueryProfileLinks extends Component {
	static propTypes = {
		requestUserProfileLinks: PropTypes.func,
	};

	componentDidMount() {
		this.props.requestUserProfileLinks();
	}

	render() {
		return null;
	}
}

export default connect( null, { requestUserProfileLinks } )( QueryProfileLinks );
