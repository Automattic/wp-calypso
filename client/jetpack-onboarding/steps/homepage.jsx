/** @format */

/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import Tile from 'components/tile-grid/tile';
import TileGrid from 'components/tile-grid';
import { saveJetpackOnboardingSettings } from 'state/jetpack-onboarding/actions';

class JetpackOnboardingHomepageStep extends React.PureComponent {
	handleHomepageSelection = homepageFormat => {
		const { siteId } = this.props;

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
			<Fragment>
				<DocumentHead title={ translate( 'Homepage ‹ Jetpack Onboarding' ) } />

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
			</Fragment>
		);
	}
}

export default connect( null, { saveJetpackOnboardingSettings } )(
	localize( JetpackOnboardingHomepageStep )
);
