/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestTimezones } from 'state/timezones/actions';
import { isRequestingTimezones } from 'state/selectors';

export class QueryTimezones extends Component {
	static propTypes = {
		isRequesting: PropTypes.bool,
		requestTimezones: PropTypes.func
	};

	componentDidMount() {
		if ( this.props.requesting ) {
			return;
		}

		this.props.requestTimezones();
	}

	render() {
		return null;
	}
}

export default connect(
	( state ) => ( {
		requesting: isRequestingTimezones( state )
	} ),
	{ requestTimezones }
)( QueryTimezones );
