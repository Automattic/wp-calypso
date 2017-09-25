/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import shallowEqual from 'react-pure-render/shallowEqual';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestUsers } from 'state/users/actions';

class QueryUsers extends Component {
	static propTypes = {
		requestUsers: PropTypes.func,
		siteId: PropTypes.number,
		userIds: PropTypes.arrayOf( PropTypes.number ),
	}

	componentWillMount() {
		this.request();
	}

	componentDidUpdate( prevProps ) {
		if (
			shallowEqual( this.props.userIds, prevProps.userIds ) &&
			this.props.siteId === prevProps.siteId
		) {
			return;
		}

		this.request();
	}

	request() {
		this.props.requestUsers( this.props.siteId, this.props.userIds );
	}

	render() {
		return null;
	}
}

export default connect(
	() => ( {} ),
	{ requestUsers }
)( QueryUsers );
