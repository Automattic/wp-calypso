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
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import CompletedSteps from '../summary-completed-steps';
import NextSteps from '../summary-next-steps';
import { getUnconnectedSiteUrl } from 'state/selectors';
import { JETPACK_ONBOARDING_STEPS as STEPS } from '../constants';

class JetpackOnboardingSummaryStep extends React.PureComponent {
	render() {
		const { basePath, siteId, siteSlug, siteUrl, steps, translate } = this.props;

		const headerText = translate( "You're ready to go!" );
		const subHeaderText = translate(
			"You've enabled Jetpack and unlocked powerful website tools that are ready for you to use. " +
				"Let's continue getting your site set up:"
		);

		return (
			<div className="steps__main">
				<DocumentHead title={ translate( 'Summary ‹ Jetpack Start' ) } />
				<PageViewTracker
					path={ [ basePath, STEPS.SUMMARY, ':site' ].join( '/' ) }
					title="Summary ‹ Jetpack Start"
				/>
				<FormattedHeader headerText={ headerText } subHeaderText={ subHeaderText } />

				<div className="steps__summary-columns">
					<div className="steps__summary-column">
						<h3 className="steps__summary-heading">{ translate( "Steps you've completed:" ) }</h3>
						<CompletedSteps
							basePath={ basePath }
							siteId={ siteId }
							siteSlug={ siteSlug }
							steps={ steps }
						/>
					</div>
					<div className="steps__summary-column">
						<h3 className="steps__summary-heading">{ translate( 'Continue your site setup:' ) }</h3>
						<NextSteps siteId={ siteId } siteSlug={ siteSlug } siteUrl={ siteUrl } />
					</div>
				</div>
				<div className="steps__button-group">
					<Button href={ siteUrl } primary>
						{ translate( 'Visit your site' ) }
					</Button>
				</div>
			</div>
		);
	}
}

export default connect( ( state, { siteId } ) => ( {
	siteUrl: getUnconnectedSiteUrl( state, siteId ),
} ) )( localize( JetpackOnboardingSummaryStep ) );
