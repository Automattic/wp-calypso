import { Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import { getLaunchReturnUrl } from 'calypso/signup/config/flows';
import StepWrapper from 'calypso/signup/step-wrapper';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';

import './style.scss';

function getErrorMessage( step ) {
	const errors = step?.errors;

	if ( Array.isArray( errors ) ) {
		return errors[ 0 ]?.message;
	}

	return errors?.message;
}

class LaunchSiteComponent extends Component {
	componentDidMount() {
		// The processing screen unmounts and remounts this step whenever the step status changes,
		// so launching on every mount turns a failed request into an endless request loop.
		const status = this.props.step?.status;

		if ( ! status || status === 'in-progress' ) {
			const { flowName, stepName } = this.props;

			this.props.submitSignupStep( { stepName } );
			this.props.goToNextStep( flowName );
		}
	}

	renderErrorContent() {
		const { signupDependencies, translate } = this.props;

		return (
			<div className="launch-site__actions">
				<Button primary href={ getLaunchReturnUrl( signupDependencies ?? {} ) }>
					{ translate( 'Go back' ) }
				</Button>
			</div>
		);
	}

	render() {
		const { flowName, positionInFlow, step, stepName, translate } = this.props;

		if ( step?.status !== 'invalid' ) {
			return null;
		}

		const headerText = translate( 'We couldn’t launch your site' );
		const message =
			getErrorMessage( step ) ||
			translate( 'Something went wrong and we couldn’t launch your site.' );

		return (
			<StepWrapper
				className="launch-site"
				flowName={ flowName }
				stepName={ stepName }
				positionInFlow={ positionInFlow }
				headerText={ headerText }
				fallbackHeaderText={ headerText }
				subHeaderText={ message }
				fallbackSubHeaderText={ message }
				hideBack
				hideSkip
				stepContent={ this.renderErrorContent() }
			/>
		);
	}
}

export default connect( null, { submitSignupStep } )( localize( LaunchSiteComponent ) );
