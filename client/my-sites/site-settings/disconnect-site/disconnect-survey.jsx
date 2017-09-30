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
		compactButtons: false,
		renderFull: false,
	};

	renderFull() {
		// placeholder
		return <div>{ ' follow-up QA' }</div>;
	}

	logReason = option => {
		this.setState( {
			reasonSelected: option.value,
			renderFull: true,
		} );
	};

	getOptions() {
		const { site } = this.props;

		const options = [
			{ value: 'tooHard', label: 'It was too hard to configure Jetpack' },
			{ value: 'didNotInclude', label: 'This plan didn’t include what I needed' },
		];

		if ( ! isFreeJetpackPlan( site.plan ) ) {
			options.push( { value: 'onlyNeedFree', label: 'This plan is too expensive' } );
		}
		return options;
	}

	getSurveyQuestions( options ) {
		const questions = [];
		for ( let i = 0; i < options.length; i++ ) {
			questions.push(
				<CompactCard href="#" onClick={ this.logReason } className="disconnect-site__survey-one">
					{ options[ i ].label }
				</CompactCard>
			);
		}
		return questions;
	}

	render() {
		const { translate, siteSlug } = this.props;
		const { reasonSelected, renderFull } = this.state;

		const textShareWhy = translate(
			'Would you mind sharing why you want to disconnect %(siteName)s from WordPress.com ',
			{
				textOnly: true,
				args: { siteName: siteSlug },
			}
		);

		const options = this.getOptions();
		const surveyQuestionsOne = this.getSurveyQuestions( options );

		return (
			<div className="disconnect-site__survey main">
				<Card className="disconnect-site__question">{ textShareWhy }</Card>
				{ surveyQuestionsOne }
				{ renderFull ? this.renderFull( reasonSelected ) : null }
			</div>
		);
	}
}

export default connect( state => ( {
	site: getSelectedSite( state ),
	siteIsJetpack: isJetpackSite( state, getSelectedSiteId( state ) ),
	siteSlug: getSelectedSiteSlug( state ),
} ) )( localize( DisconnectSurvey ) );
