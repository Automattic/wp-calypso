/** @format */

/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import StepWrapper from 'signup/step-wrapper';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormFieldset from 'components/forms/form-fieldset';

class SiteTopicStep extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number.isRequired,
		setSiteTopic: PropTypes.func.isRequired,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,
	};

	state = {
		siteTopic: '',
	};

	onChangeTopic = event => this.setState( { siteTopic: event.target.value } );

	// TODO:
	// Handle submission.
	submitSiteTopic( event ) {
		event.preventDefault();
	}

	renderContent() {
		const { translate } = this.props;
		const { siteTopic } = this.state;

		return (
			<Card className="site-topic__content">
				<form onSubmit={ this.submitSiteTopic }>
					<FormFieldset>
						<FormLabel htmlFor="siteTopic">{ translate( 'Type of Business' ) }</FormLabel>
						<FormTextInput
							id="siteTopic"
							name="siteTopic"
							placeholder={ translate( 'e.g. Fashion, travel, design, plumber, electrician' ) }
							value={ this.state.siteTopic }
							onChange={ this.onChangeTopic }
							autoComplete="off"
						/>
					</FormFieldset>
					<Button type="submit" disabled={ ! siteTopic } primary>
						{ translate( 'Continue' ) }
					</Button>
					<span className="site-topic__form-description">
						{ translate( 'Search above to continue' ) }
					</span>
				</form>
			</Card>
		);
	}

	render() {
		const { translate } = this.props;
		const headerText = translate( 'Search for your type of business.' );
		const subHeaderText = translate( "Don't stress, you can change this later." );

		return (
			<div>
				<StepWrapper
					flowName={ this.props.flowName }
					stepName={ this.props.stepName }
					positionInFlow={ this.props.positionInFlow }
					headerText={ headerText }
					subHeaderText={ subHeaderText }
					signupProgress={ this.props.signupProgress }
					stepContent={ this.renderContent() }
					goToNextStep={ this.skipStep }
				/>
			</div>
		);
	}
}

// TODO:
// Connect to the real action creators and selectors.
export default connect(
	null,
	{ setSiteTopic: () => {} }
)( localize( SiteTopicStep ) );
