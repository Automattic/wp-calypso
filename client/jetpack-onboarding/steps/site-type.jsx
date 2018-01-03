/** @format */

/**
 * External dependencies
 */
import React from 'react';
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

class JetpackOnboardingSiteTypeStep extends React.PureComponent {
	render() {
		const { translate } = this.props;
		const headerText = translate( "Let's shape your new site." );
		const subHeaderText = translate( 'What kind of site do you need? Choose an option below:' );

		return (
			<div className="steps__main">
				<DocumentHead title={ translate( 'Site Type ‹ Jetpack Onboarding' ) } />
				<PageViewTracker
					path={ '/jetpack/onboarding/' + STEPS.SITE_TYPE + '/:site' }
					title="Site Type ‹ Jetpack Onboarding"
				/>

				<FormattedHeader headerText={ headerText } subHeaderText={ subHeaderText } />

				<TileGrid>
					<Tile
						buttonLabel={ translate( 'Personal site' ) }
						description={ translate(
							'To share your ideas, stories, photographs, or creative projects with your followers.'
						) }
						image={ '/calypso/images/illustrations/type-personal.svg' }
					/>
					<Tile
						buttonLabel={ translate( 'Business site' ) }
						description={ translate(
							'To promote your business, organization, or brand, sell products or services, or connect with your audience.'
						) }
						image={ '/calypso/images/illustrations/type-business.svg' }
					/>
				</TileGrid>
			</div>
		);
	}
}

export default localize( JetpackOnboardingSiteTypeStep );
