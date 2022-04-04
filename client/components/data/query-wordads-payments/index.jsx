import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { requestWordadsPayments } from 'calypso/state/wordads/payments/actions';

class QueryWordadsPayments extends Component {
	static propTypes = {
		requestWordadsPayments: PropTypes.func,
		siteId: PropTypes.number,
	};

	static defaultProps = {
		requestWordadsPayments: () => {},
	};

	componentDidMount() {
		this.props.requestWordadsPayments( this.props.siteId );
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.siteId !== prevProps.siteId ) {
			this.props.requestWordadsPayments( this.props.siteId );
		}
	}

	render() {
		return null;
	}
}

export default connect( null, { requestWordadsPayments } )( QueryWordadsPayments );
