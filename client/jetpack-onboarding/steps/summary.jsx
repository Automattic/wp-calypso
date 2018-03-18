/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import FormattedHeader from 'components/formatted-header';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import CompletedSteps from '../summary-completed-steps';
import NextSteps from '../summary-next-steps';
import { getSiteUrl, getUnconnectedSiteUrl } from 'state/selectors';
import { JETPACK_ONBOARDING_STEPS as STEPS } from '../constants';

class JetpackOnboardingSummaryStep extends React.PureComponent {
	handleSummaryStepClick = ( stepName, stepType ) => () => {
		this.props.recordJpoEvent( 'calypso_jpo_summary_step_link_clicked', {
			step: stepName,
			type: stepType,
		} );
	};

	render() {
		const { basePath, siteId, siteSlug, siteUrl, steps, translate } = this.props;

		const headerText = translate( "You're ready to go!" );
		const subHeaderText = translate(
			"You've enabled Jetpack and unlocked powerful website tools that are ready for you to use. " +
				"Let's continue getting your site set up:"
		);

		return (
			<div className="steps__main">
				<PageViewTracker
					path={ [ basePath, STEPS.SUMMARY, ':site' ].join( '/' ) }
					title="Summary ‹ Jetpack Start"
				/>
				<FormattedHeader headerText={ headerText } subHeaderText={ subHeaderText } />

				<Card>
					<div className="steps__summary-columns">
						<div className="steps__summary-column">
							<h3 className="steps__summary-heading">{ translate( "Steps you've completed:" ) }</h3>
							<CompletedSteps
								basePath={ basePath }
								onClick={ this.handleSummaryStepClick }
								siteId={ siteId }
								siteSlug={ siteSlug }
								steps={ steps }
							/>
						</div>
						<div className="steps__summary-column">
							<h3 className="steps__summary-heading">
								{ translate( 'Continue your site setup:' ) }
							</h3>
							<NextSteps
								onClick={ this.handleSummaryStepClick }
								siteId={ siteId }
								siteSlug={ siteSlug }
								siteUrl={ siteUrl }
							/>
						</div>
					</div>
					<div className="steps__button-group">
						<Button href={ siteUrl } primary>
							{ translate( 'Visit your site' ) }
						</Button>
					</div>
				</Card>
			</div>
		);
	}
}

export default connect( ( state, { siteId } ) => ( {
	siteUrl: getSiteUrl( state, siteId ) || getUnconnectedSiteUrl( state, siteId ),
} ) )( localize( JetpackOnboardingSummaryStep ) );
