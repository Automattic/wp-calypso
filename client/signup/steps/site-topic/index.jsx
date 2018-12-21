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
import SiteVerticalsSuggestionSearch from 'components/site-verticals-suggestion-search';
import { submitSiteVertical, setSiteVertical } from 'state/signup/steps/site-vertical/actions';
import { getSiteVerticalName } from 'state/signup/steps/site-vertical/selectors';
import { getSiteType } from 'state/signup/steps/site-type/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import SignupActions from 'lib/signup/actions';
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

	onSiteTopicChange = ( { vertical_name, vertical_slug } ) => {
		this.setState( {
			siteTopicValue: vertical_name,
			siteTopicSlug: vertical_slug,
		} );
		if ( this.props.flowName === 'onboarding-dev' ) {
			this.props.setSiteTopic( vertical_name );
		}
	};

	onSubmit = event => {
		event.preventDefault();
		this.props.submitSiteTopic( this.state );
	};

	renderContent() {
		return (
			<div className="site-topic__content">
				<form onSubmit={ this.onSubmit }>
					<FormFieldset>
						<Gridicon icon="search" />
						<SiteVerticalsSuggestionSearch
							onChange={ this.onSiteTopicChange }
							initialValue={ this.state.siteTopicValue }
						/>
						<Button type="submit" disabled={ ! this.state.siteTopicValue } primary>
							{ this.props.translate( 'Continue' ) }
						</Button>
					</FormFieldset>
				</form>
			</div>
		);
	}

	getTextFromSiteType() {
		const headerText = getSiteTypePropertyValue( 'slug', this.props.siteType, 'siteTopicHeader' ) || '';
		// once we have more granular copies per segments, these two should only be used for the default case.
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
				/>
			</div>
		);
	}
}

const mapDispatchToProps = ( dispatch, ownProps ) => ( {
	submitSiteTopic: ( { siteTopicSlug, siteTopicValue } ) => {
		const { flowName, goToNextStep } = ownProps;

		dispatch(
			recordTracksEvent( 'calypso_signup_actions_submit_site_topic', {
				value: siteTopicSlug,
			} )
		);

		dispatch( submitSiteVertical( { name: siteTopicValue } ) );

		goToNextStep( flowName );
	},

	setSiteTopic: siteTopic => {
		dispatch( setSiteVertical( { name: siteTopic } ) );
	},
} );

export default localize(
	connect(
		state => ( {
			siteTopic: getSiteVerticalName( state ),
			siteType: getSiteType( state ),
		} ),
		mapDispatchToProps
	)( SiteTopicStep )
);
