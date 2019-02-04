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
import SiteVerticalsSuggestionSearch, {
	isVerticalSearchPending,
} from 'components/site-verticals-suggestion-search';
import { submitSiteVertical, setSiteVertical } from 'state/signup/steps/site-vertical/actions';
import {
	getSiteVerticalName,
	getSiteVerticalSlug,
	getSiteVerticalIsUserInput,
} from 'state/signup/steps/site-vertical/selectors';
import { getSiteType } from 'state/signup/steps/site-type/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import SignupActions from 'lib/signup/actions';
import { getSiteTypePropertyValue } from 'lib/signup/site-type';

/**
 * Style dependencies
 */
import './style.scss';

class SiteTopicStep extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		isUserInput: PropTypes.bool,
		positionInFlow: PropTypes.number.isRequired,
		submitSiteTopic: PropTypes.func.isRequired,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,
		siteTopic: PropTypes.string,
		siteSlug: PropTypes.string,
		siteType: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		siteTopic: '',
		siteSlug: '',
		isUserInput: true,
	};

	componentDidMount() {
		SignupActions.saveSignupStep( {
			stepName: this.props.stepName,
		} );
	}

	onSiteTopicChange = verticalData => {
		this.props.setSiteVertical( {
			isUserInput: verticalData.isUserInputVertical,
			name: verticalData.verticalName,
			preview: verticalData.preview,
			slug: verticalData.verticalSlug,
			id: verticalData.verticalId,
		} );
	};

	onSubmit = event => {
		event.preventDefault();
		const { isUserInput, submitSiteTopic, siteTopic, siteSlug } = this.props;
		submitSiteTopic( {
			isUserInput,
			name: siteTopic,
			slug: siteSlug,
		} );
	};

	renderContent() {
		const { isButtonDisabled, siteTopic, translate } = this.props;
		return (
			<div className="site-topic__content">
				<form onSubmit={ this.onSubmit }>
					<FormFieldset>
						<SiteVerticalsSuggestionSearch
							onChange={ this.onSiteTopicChange }
							initialValue={ siteTopic }
							autoFocus={ true } // eslint-disable-line jsx-a11y/no-autofocus
						/>
						<Button type="submit" disabled={ isButtonDisabled } primary>
							{ translate( 'Continue' ) }
						</Button>
					</FormFieldset>
				</form>
			</div>
		);
	}

	getTextFromSiteType() {
		// once we have more granular copies per segments, these should only be used for the default case.
		const headerText =
			getSiteTypePropertyValue( 'slug', this.props.siteType, 'siteTopicHeader' ) || '';
		const commonSubHeaderText = '';

		return {
			headerText,
			commonSubHeaderText,
		};
	}

	render() {
		const { headerText, commonSubHeaderText } = this.getTextFromSiteType();

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
					stepContent={ this.renderContent() }
					showSiteMockups={ this.props.showSiteMockups }
				/>
			</div>
		);
	}
}

const mapDispatchToProps = ( dispatch, ownProps ) => ( {
	submitSiteTopic: ( { isUserInput, name, slug } ) => {
		const { flowName, goToNextStep, stepName } = ownProps;

		dispatch(
			recordTracksEvent( 'calypso_signup_actions_submit_site_topic', {
				value: slug,
				is_user_input_vertical: isUserInput,
			} )
		);

		dispatch(
			submitSiteVertical(
				{
					isUserInput,
					name,
					slug,
				},
				stepName
			)
		);

		goToNextStep( flowName );
	},

	setSiteVertical: verticalData => dispatch( setSiteVertical( verticalData ) ),
} );

export default localize(
	connect(
		state => {
			const siteTopic = getSiteVerticalName( state );
			const isButtonDisabled = ! siteTopic || isVerticalSearchPending();
			return {
				siteTopic,
				siteSlug: getSiteVerticalSlug( state ),
				siteType: getSiteType( state ),
				isUserInput: getSiteVerticalIsUserInput( state ),
				isButtonDisabled,
			};
		},
		mapDispatchToProps
	)( SiteTopicStep )
);
