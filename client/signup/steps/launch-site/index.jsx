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
import { launchSite } from 'state/sites/launch/actions';

class LaunchSiteComponent extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			siteId: props.siteId,
		};
	}

	componentDidMount() {
		this.props.launchPrivateSite( this.props.siteId );
	}

	render() {
		return null;
	}
}

export default connect(
	null,
	( dispatch, ownProps ) => ( {
		launchPrivateSite: () => {
			const { flowName, stepName, stepSectionName, goToNextStep } = ownProps;

			dispatch( launchSite( ownProps.signupDependencies.siteId ) );

			SignupActions.submitSignupStep(
				{
					stepName,
					stepSectionName,
				},
				[],
				{}
			);

			goToNextStep( flowName );
		},
	} )
)( localize( LaunchSiteComponent ) );
