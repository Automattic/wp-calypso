/**
 * External dependencies
 */
import { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestUserDevices } from 'state/user-devices/actions';
import { getUserDevices } from 'state/selectors';

class QueryUserDevices extends Component {
	static propTypes = {
		requestUserDevices: PropTypes.func
	}

	componentDidMount() {
		if ( this.props.devices === null ) {
			this.props.requestUserDevices();
		}
	}

	render() {
		return null;
	}
}

export default connect(
	state => ( {
		devices: getUserDevices( state )
	} ),
	{ requestUserDevices }
)( QueryUserDevices );
