/**
 * External dependencies
 */
import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import shallowEqual from 'react-pure-render/shallowEqual';

/**
 * Internal dependencies
 */
import { requestUsers } from 'state/users/actions';

class QueryUsers extends Component {
	componentWillMount() {
		this.request();
	}

	componentDidUpdate( prevProps ) {
		if (
			shallowEqual( this.props.usersId, prevProps.usersId ) &&
			this.props.siteId === prevProps.siteId
		) {
			return;
		}

		this.request();
	}

	request() {
		this.props.requestUsers( this.props.siteId, this.props.usersId );
	}

	render() {
		return null;
	}
}

QueryUsers.propTypes = {
	requestUsers: PropTypes.func,
	siteId: PropTypes.number,
	usersId: PropTypes.arrayOf( PropTypes.number ),
};

export default connect(
	() => ( {} ),
	{ requestUsers }
)( QueryUsers );
