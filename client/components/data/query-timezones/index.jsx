
/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestTimezones } from 'state/timezones/actions';

export class QueryTimezones extends Component {
	static propTypes = {
		requestTimezones: PropTypes.func
	};

	componentDidMount() {
		this.props.requestTimezones();
	}

	render() {
		return null;
	}
}

export default connect( null, ( { requestTimezones } ) )( QueryTimezones );
