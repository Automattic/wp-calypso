/** @format */
/**
 * External dependencies
 */
import { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import SignupActions from 'lib/signup/actions';

class LaunchSiteComponent extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			siteId: props.siteId,
		};
	}

	componentDidMount() {
		const { flowName, stepName, goToNextStep } = this.props;
		SignupActions.submitSignupStep(
			{
				stepName,
			},
			[],
			{}
		);

		goToNextStep( flowName );
	}

	render() {
		return null;
	}
}

export default connect(
	null,
	() => ( {} )
)( localize( LaunchSiteComponent ) );
