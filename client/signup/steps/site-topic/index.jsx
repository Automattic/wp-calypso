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
import { getSiteType } from 'state/signup/steps/site-type/selectors';
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
		siteType: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	constructor( props ) {
		super( props );

		this.state = {
			siteTopicValue: props.siteTopic || '',
		};
	}

	componentDidMount() {
		SignupActions.saveSignupStep( {
			stepName: this.props.stepName,
		} );
	}

	onSiteTopicChange = value => {
		this.setState( { siteTopicValue: value } );
	};

	onSubmit = event => {
		event.preventDefault();

		this.props.submitSiteTopic( this.trimedSiteTopicValue() );
	};

	trimedSiteTopicValue = () => this.state.siteTopicValue.trim();

	renderContent( topicLabel, placeholder ) {
		const currentSiteTopic = this.trimedSiteTopicValue();

		return (
			<Card className="site-topic__content">
				<form onSubmit={ this.onSubmit }>
					<FormFieldset>
						<FormLabel htmlFor="siteTopic">{ topicLabel }</FormLabel>
						<SuggestionSearch
							id="siteTopic"
							placeholder={ placeholder }
							onChange={ this.onSiteTopicChange }
							suggestions={ Object.values( hints ) }
							value={ currentSiteTopic }
						/>
					</FormFieldset>
					<Button type="submit" disabled={ ! currentSiteTopic } primary>
						{ this.props.translate( 'Continue' ) }
					</Button>
				</form>
			</Card>
		);
	}

	getTextFromSiteType() {
		const packText = ( headerText, subHeaderText, topicLabel, placeholder ) => ( {
			headerText,
			subHeaderText,
			topicLabel,
			placeholder,
		} );
		const { siteType, translate } = this.props;

		// once we have more granular copies per segments, these two should only be used for the default case.
		const commonPlaceholder = translate( 'e.g. Fashion, travel, design, plumber, electrician' );
		const commonSubHeaderText = translate( "Don't stress, you can change this later." );

		switch ( siteType ) {
			case 'Business':
				return packText(
					translate( 'Search for your type of business.' ),
					commonSubHeaderText,
					translate( 'Type of Business' ),
					commonPlaceholder
				);
			default:
				return packText(
					translate( 'What will your site be about?' ),
					commonSubHeaderText,
					translate( 'Type of Site' ),
					commonPlaceholder
				);
		}
	}

	render() {
		const { headerText, subHeaderText, topicLabel, placeholder } = this.getTextFromSiteType();

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
					stepContent={ this.renderContent( topicLabel, placeholder ) }
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
			siteType: getSiteType( state ),
		} ),
		mapDispatchToProps
	)( SiteTopicStep )
);
