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
import {
	getSiteVerticalName,
	getSiteVerticalSlug,
} from 'state/signup/steps/site-vertical/selectors';
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
		siteSlug: PropTypes.string,
		siteType: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		siteTopic: '',
		siteSlug: '',
	};

	componentDidMount() {
		SignupActions.saveSignupStep( {
			stepName: this.props.stepName,
		} );
	}

	onSiteTopicChange = verticalData => this.props.setSiteTopic( { ...verticalData } );

	onSubmit = event => {
		event.preventDefault();
		const { submitSiteTopic, siteTopic, siteSlug } = this.props;
		submitSiteTopic( {
			vertical_name: siteTopic,
			vertical_slug: siteSlug,
		} );
	};

	renderContent() {
		const { translate, siteTopic } = this.props;
		return (
			<div className="site-topic__content">
				<form onSubmit={ this.onSubmit }>
					<FormFieldset>
						<Gridicon icon="search" />
						<SiteVerticalsSuggestionSearch
							onChange={ this.onSiteTopicChange }
							initialValue={ siteTopic }
						/>
						<Button type="submit" disabled={ ! siteTopic } primary>
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
				/>
			</div>
		);
	}
}

const mapDispatchToProps = ( dispatch, ownProps ) => ( {
	submitSiteTopic: ( { vertical_name, vertical_slug } ) => {
		const { flowName, goToNextStep } = ownProps;

		dispatch(
			recordTracksEvent( 'calypso_signup_actions_submit_site_topic', {
				value: vertical_slug,
			} )
		);

		dispatch( submitSiteVertical( { name: vertical_name, slug: vertical_slug } ) );

		goToNextStep( flowName );
	},

	setSiteTopic: ( { vertical_name, vertical_slug } ) => {
		dispatch( setSiteVertical( { name: vertical_name, slug: vertical_slug } ) );
		dispatch(
			recordTracksEvent( 'calypso_signup_actions_select_site_topic', {
				vertical_name,
			} )
		);
	},
} );

export default localize(
	connect(
		state => ( {
			siteTopic: getSiteVerticalName( state ) || '',
			siteSlug: getSiteVerticalSlug( state ) || '',
			siteType: getSiteType( state ),
		} ),
		mapDispatchToProps
	)( SiteTopicStep )
);
