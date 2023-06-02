import { Component } from 'react';
import { connect } from 'react-redux';
import { fetchUserSettings } from 'calypso/state/user-settings/actions';

class QueryUserSettings extends Component {
	componentDidMount() {
		this.props.fetchUserSettings();
	}

	render() {
		return null;
	}
}

export default connect( null, { fetchUserSettings } )( QueryUserSettings );
