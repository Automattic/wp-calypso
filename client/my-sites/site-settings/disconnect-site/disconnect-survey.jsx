/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CompactCard from 'components/card/compact';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { isFreeJetpackPlan } from 'lib/products-values';
import { isJetpackSite } from 'state/sites/selectors';

class DisconnectSurvey extends Component {
	state = {
		reasonSelected: 'onlyNeedFree',
		renderInitial: true,
	};

	renderFollowUp() {
		// placeholder
		return <Card className="disconnect-site__question">{ 'follow-up' }</Card>;
	}

	logSelection = option => {
		this.setState( {
			reasonSelected: option.value,
			renderInitial: false,
		} );
	};

	getOptions() {
		const { translate, site } = this.props;

		const options = [
			{ value: 'tooHard', label: translate( 'It was too hard to configure Jetpack' ) },
			{ value: 'didNotInclude', label: translate( 'This plan didn’t include what I needed' ) },
		];

		if ( ! isFreeJetpackPlan( site.plan ) ) {
			options.push( { value: 'onlyNeedFree', label: translate( 'This plan is too expensive' ) } );
		}
		options.push( {
			value: 'troubleshoot',
			label: translate( "This is temporary -- I'm troubleshooting a problem." ),
		} );

		return options;
	}

	getSurveyQuestions( options ) {
		const questions = [];
		for ( let i = 0; i < options.length; i++ ) {
			questions.push(
				<CompactCard href="#" onClick={ this.logSelection } className="disconnect-site__survey-one">
					{ options[ i ].label }
				</CompactCard>
			);
		}
		return questions;
	}

	renderEntryQuestion() {
		const { translate, siteSlug } = this.props;

		const textShareWhy = translate( "I'm disconnecting my site %(siteName)s because:", {
			textOnly: true,
			args: { siteName: siteSlug },
		} );
		const options = this.getOptions();
		const surveyQuestionsOne = this.getSurveyQuestions( options );
		return (
			<div>
				<Card className="disconnect-site__question">{ textShareWhy }</Card>
				{ surveyQuestionsOne }
			</div>
		);
	}

	render() {
		const { reasonSelected, renderInitial } = this.state;
		return (
			<div className="disconnect-site__card">
				{ renderInitial ? this.renderEntryQuestion() : this.renderFollowUp( reasonSelected ) }
			</div>
		);
	}
}

export default connect( state => ( {
	site: getSelectedSite( state ),
	siteIsJetpack: isJetpackSite( state, getSelectedSiteId( state ) ),
	siteSlug: getSelectedSiteSlug( state ),
} ) )( localize( DisconnectSurvey ) );
