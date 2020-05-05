/**
 * External dependencies
 */
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { submitSignupStep } from 'state/signup/progress/actions';

class LaunchSiteComponent extends Component {
	componentDidMount() {
		const { flowName, stepName } = this.props;
		this.props.submitSignupStep(
			{ stepName },
			{ isPreLaunch: this.props.flowName === 'new-launch' }
		);
		this.props.goToNextStep( flowName );
	}

	render() {
		return null;
	}
}

export default connect( null, { submitSignupStep } )( LaunchSiteComponent );
