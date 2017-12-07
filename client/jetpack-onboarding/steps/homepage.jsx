/** @format */

/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import Tile from 'components/tile-grid/tile';
import TileGrid from 'components/tile-grid';

class JetpackOnboardingHomepageStep extends React.PureComponent {
	render() {
		const { translate } = this.props;
		const headerText = translate( "Let's shape your new site." );
		const subHeaderText = translate( 'What should visitors see on your homepage?' );

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
					/>
					<Tile
						buttonLabel={ translate( 'A static welcome page' ) }
						description={ translate( 'Have your homepage stay the same as time goes on.' ) }
						image={ '/calypso/images/illustrations/homepage-static.svg' }
					/>
				</TileGrid>
			</Fragment>
		);
	}
}

export default localize( JetpackOnboardingHomepageStep );
