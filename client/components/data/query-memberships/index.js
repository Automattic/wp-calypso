import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { requestProducts } from 'calypso/state/memberships/product-list/actions';

class QueryMemberships extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		requestProducts: PropTypes.func,
	};

	request() {
		if ( this.props.requesting ) {
			return;
		}

		if ( ! this.props.siteId ) {
			return;
		}

		this.props.requestProducts( this.props.siteId );
	}

	componentDidMount() {
		this.request();
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.siteId !== prevProps.siteId ) {
			this.request();
		}
	}

	render() {
		return null;
	}
}

export default connect( null, { requestProducts } )( QueryMemberships );
