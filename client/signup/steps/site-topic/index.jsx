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
import InfoPopover from 'components/info-popover';
import FormFieldset from 'components/forms/form-fieldset';
import SuggestionSearch from 'components/suggestion-search';
import { setSiteTopic } from 'state/signup/steps/site-topic/actions';
import { getSignupStepsSiteTopic } from 'state/signup/steps/site-topic/selectors';
import { getSiteType } from 'state/signup/steps/site-type/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import SignupActions from 'lib/signup/actions';
import { hints } from 'lib/signup/hint-data';
import { getSiteTypePropertyValue } from 'lib/signup/site-type';

/**
 * Style dependencies
 */
import './style.scss';

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
		const { translate } = this.props;
		const currentSiteTopic = this.trimedSiteTopicValue();

		return (
			<Card className="site-topic__content">
				<form onSubmit={ this.onSubmit }>
					<FormFieldset>
						<FormLabel htmlFor="siteTopic">
							{ topicLabel }
							<InfoPopover className="site-topic__info-popover" position="top">
								{ translate( "We'll use this to personalize your site and experience." ) }
							</InfoPopover>
						</FormLabel>
						<SuggestionSearch
							id="siteTopic"
							placeholder={ placeholder }
							onChange={ this.onSiteTopicChange }
							suggestions={ Object.values( hints ) }
							value={ currentSiteTopic }
						/>
					</FormFieldset>
					<div className="site-topic__submit-wrapper">
						<Button type="submit" disabled={ ! currentSiteTopic } primary>
							{ translate( 'Continue' ) }
						</Button>
					</div>
				</form>
			</Card>
		);
	}

	getTextFromSiteType() {
		const { siteType, translate } = this.props;

		const headerText = getSiteTypePropertyValue( 'slug', siteType, 'siteTopicHeader' ) || '';
		const topicLabel = getSiteTypePropertyValue( 'slug', siteType, 'siteTopicLabel' ) || '';
		// once we have more granular copies per segments, these two should only be used for the default case.
		const commonPlaceholder = translate( 'e.g. Fashion, travel, design, plumber, electrician' );
		const commonSubHeaderText = translate( "Don't stress, you can change this later." );

		return {
			headerText,
			commonSubHeaderText,
			topicLabel,
			commonPlaceholder,
		};
	}

	render() {
		const {
			headerText,
			commonSubHeaderText,
			topicLabel,
			commonPlaceholder,
		} = this.getTextFromSiteType();

		return (
			<div>
				<StepWrapper
					flowName={ this.props.flowName }
					stepName={ this.props.stepName }
					positionInFlow={ this.props.positionInFlow }
					headerText={ headerText }
					fallbackHeaderText={ headerText }
					subHeaderText={ commonSubHeaderText }
					fallbackSubHeaderText={ commonSubHeaderText }
					signupProgress={ this.props.signupProgress }
					stepContent={ this.renderContent( topicLabel, commonPlaceholder ) }
				/>
			</div>
		);
	}
}

const mapDispatchToProps = ( dispatch, ownProps ) => ( {
	submitSiteTopic: siteTopic => {
		const { translate, flowName, stepName, goToNextStep } = ownProps;

		dispatch( setSiteTopic( siteTopic ) );
		dispatch(
			recordTracksEvent( 'calypso_signup_actions_submit_site_topic', {
				value: siteTopic,
			} )
		);

		SignupActions.submitSignupStep(
			{
				processingMessage: translate( 'Collecting your information' ),
				stepName,
			},
			[],
			{
				siteTopic,
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
