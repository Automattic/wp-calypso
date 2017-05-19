/**
 * External dependencies
 */
import { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestUserDevices } from 'state/user-devices/actions';
import { isRequestingUserDevices } from 'state/selectors';

class QueryUserDevices extends Component {
	static propTypes = {
		isRequesting: PropTypes.bool,
		requestUserDevices: PropTypes.func
	}

	componentWillMount() {
		if ( this.props.requesting ) {
			return;
		}

		this.props.requestUserDevices();
	}

	render() {
		return null;
	}
}

export default connect(
	state => ( {
		requesting: isRequestingUserDevices( state )
	} ),
	{ requestUserDevices }
)( QueryUserDevices );
