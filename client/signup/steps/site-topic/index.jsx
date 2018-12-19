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
import StepWrapper from 'signup/step-wrapper';
import FormFieldset from 'components/forms/form-fieldset';
import SuggestionSearch from 'components/suggestion-search';
import { submitSiteTopic, setSiteTopic } from 'state/signup/steps/site-topic/actions';
import { getSignupStepsSiteTopic } from 'state/signup/steps/site-topic/selectors';
import { getSiteType } from 'state/signup/steps/site-type/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import SignupActions from 'lib/signup/actions';
import { hints } from 'lib/signup/hint-data';
import { getSiteTypePropertyValue } from 'lib/signup/site-type';
import Gridicon from 'gridicons';

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
		if ( this.props.flowName === 'onboarding-dev' ) {
			this.props.setSiteTopic( value );
		}
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
			<div className="site-topic__content">
				<form onSubmit={ this.onSubmit }>
					<FormFieldset>
						<Gridicon icon="search" />
						<SuggestionSearch
							id="siteTopic"
							placeholder={ placeholder }
							onChange={ this.onSiteTopicChange }
							suggestions={ Object.values( hints ) }
							value={ currentSiteTopic }
						/>

						<Button type="submit" disabled={ ! currentSiteTopic } primary>
							{ translate( 'Continue' ) }
						</Button>
					</FormFieldset>
				</form>
			</div>
		);
	}

	getTextFromSiteType() {
		const { siteType, translate } = this.props;

		const headerText = getSiteTypePropertyValue( 'slug', siteType, 'siteTopicHeader' ) || '';
		const topicLabel = getSiteTypePropertyValue( 'slug', siteType, 'siteTopicLabel' ) || '';
		// once we have more granular copies per segments, these two should only be used for the default case.
		const commonPlaceholder = translate( 'e.g. Fashion, travel, design, plumber, electrician' );
		const commonSubHeaderText = '';

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
		const { flowName, goToNextStep } = ownProps;

		dispatch(
			recordTracksEvent( 'calypso_signup_actions_submit_site_topic', {
				value: siteTopic,
			} )
		);

		dispatch( submitSiteTopic( siteTopic ) );

		goToNextStep( flowName );
	},

	setSiteTopic: siteTopic => {
		dispatch( setSiteTopic( siteTopic ) );
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
