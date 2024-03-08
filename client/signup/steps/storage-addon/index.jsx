import { Component } from 'react';
import { connect } from 'react-redux';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';

class StorageAddonComponent extends Component {
	componentDidMount() {
		const { flowName, stepName } = this.props;
		this.props.submitSignupStep( { stepName } );
		this.props.goToNextStep( flowName );
	}

	render() {
		return null;
	}
}

export default connect( null, { submitSignupStep } )( StorageAddonComponent );
