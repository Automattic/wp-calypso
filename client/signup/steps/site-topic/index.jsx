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
import FormFieldset from 'components/forms/form-fieldset';
import SuggestionSearch from 'components/suggestion-search';
import { setSiteTopic } from 'state/signup/steps/site-topic/actions';
import { getSignupStepsSiteTopic } from 'state/signup/steps/site-topic/selectors';
import SignupActions from 'lib/signup/actions';
import { hints } from 'lib/signup/hint-data';

class SiteTopicStep extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number.isRequired,
		submitSiteTopic: PropTypes.func.isRequired,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,
		siteTopic: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	constructor( props ) {
		super( props );

		this.state = {
			siteTopicValue: props.siteTopic || '',
		};
	}

	onSiteTopicChange = value => {
		this.setState( { siteTopicValue: value } );
	};

	onSubmit = event => {
		event.preventDefault();

		this.props.submitSiteTopic( this.trimedSiteTopicValue() );
	};

	trimedSiteTopicValue = () => this.state.siteTopicValue.trim();

	renderContent() {
		const { translate } = this.props;

		return (
			<Card className="site-topic__content">
				<form onSubmit={ this.onSubmit }>
					<FormFieldset>
						<FormLabel htmlFor="siteTopic">{ translate( 'Type of Business' ) }</FormLabel>
						<SuggestionSearch
							id="siteTopic"
							placeholder={ translate( 'e.g. Fashion, travel, design, plumber, electrician' ) }
							onChange={ this.onSiteTopicChange }
							suggestions={ Object.values( hints ) }
						/>
					</FormFieldset>
					<Button type="submit" disabled={ ! this.trimedSiteTopicValue() } primary>
						{ translate( 'Continue' ) }
					</Button>
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
					fallbackHeaderText={ headerText }
					subHeaderText={ subHeaderText }
					fallbackSubHeaderText={ subHeaderText }
					signupProgress={ this.props.signupProgress }
					stepContent={ this.renderContent() }
					goToNextStep={ this.skipStep }
				/>
			</div>
		);
	}
}

const mapDispatchToProps = ( dispatch, ownProps ) => ( {
	submitSiteTopic: siteTopicValue => {
		const { translate, flowName, stepName, goToNextStep } = ownProps;

		dispatch( setSiteTopic( siteTopicValue ) );

		SignupActions.submitSignupStep(
			{
				processingMessage: translate( 'Collecting your information' ),
				stepName,
			},
			[],
			{
				siteTopic: siteTopicValue,
			}
		);

		goToNextStep( flowName );
	},
} );

export default localize(
	connect(
		state => ( {
			siteTopic: getSignupStepsSiteTopic( state ),
		} ),
		mapDispatchToProps
	)( SiteTopicStep )
);
