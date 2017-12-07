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
import Main from 'components/main';
import Tile from 'components/tile-grid/tile';
import TileGrid from 'components/tile-grid';

class JetpackOnboardingSiteTypeStep extends React.PureComponent {
	render() {
		const { translate } = this.props;
		const headerText = translate( "Let's shape your new site." );
		const subHeaderText = translate( 'What kind of site do you need? Choose an option below:' );

		return (
			<Main>
				<DocumentHead title={ translate( 'Jetpack Onboarding' ) } />

				<FormattedHeader headerText={ headerText } subHeaderText={ subHeaderText } />

				<TileGrid>
					<Tile
						buttonLabel={ 'Personal site' }
						description={
							'To share your ideas, stories, photographs, or creative projects with your followers.'
						}
						image={ '/calypso/images/illustrations/type-personal.svg' }
					/>
					<Tile
						buttonLabel={ 'Business site' }
						description={
							'To promote your business, organization, or brand, sell products or services, or connect with your audience.'
						}
						image={ '/calypso/images/illustrations/type-business.svg' }
					/>
				</TileGrid>
			</Main>
		);
	}
}

export default localize( JetpackOnboardingSiteTypeStep );
