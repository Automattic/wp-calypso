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
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import Tile from 'components/tile-grid/tile';
import TileGrid from 'components/tile-grid';
import { JETPACK_ONBOARDING_STEPS as STEPS } from '../constants';
import { saveJetpackOnboardingSettings } from 'state/jetpack-onboarding/actions';

class JetpackOnboardingHomepageStep extends React.PureComponent {
	handleHomepageSelection = homepageFormat => () => {
		const { siteId } = this.props;

		this.props.recordJpoEvent( 'calypso_jpo_homepage_format_clicked', {
			homepageFormat,
		} );

		return () => {
			this.props.saveJetpackOnboardingSettings( siteId, {
				homepageFormat,
			} );
		};
	};

	render() {
		const { getForwardUrl, translate } = this.props;
		const headerText = translate( "Let's shape your new site." );
		const subHeaderText = translate( 'What should visitors see on your homepage?' );
		const forwardUrl = getForwardUrl();

		return (
			<div className="steps__main">
				<DocumentHead title={ translate( 'Homepage ‹ Jetpack Onboarding' ) } />
				<PageViewTracker
					path={ '/jetpack/onboarding/' + STEPS.HOMEPAGE + '/:site' }
					title="Homepage ‹ Jetpack Onboarding"
				/>

				<FormattedHeader headerText={ headerText } subHeaderText={ subHeaderText } />

				<TileGrid>
					<Tile
						buttonLabel={ translate( 'Recent news or updates' ) }
						description={ translate(
							'We can pull the latest information into your homepage for you.'
						) }
						image={ '/calypso/images/illustrations/homepage-news.svg' }
						href={ forwardUrl }
						onClick={ this.handleHomepageSelection( 'posts' ) }
					/>
					<Tile
						buttonLabel={ translate( 'A static welcome page' ) }
						description={ translate( 'Have your homepage stay the same as time goes on.' ) }
						image={ '/calypso/images/illustrations/homepage-static.svg' }
						href={ forwardUrl }
						onClick={ this.handleHomepageSelection( 'page' ) }
					/>
				</TileGrid>
			</div>
		);
	}
}

export default connect( null, { saveJetpackOnboardingSettings } )(
	localize( JetpackOnboardingHomepageStep )
);
