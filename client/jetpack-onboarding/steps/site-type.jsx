/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormattedHeader from 'components/formatted-header';
import Tile from 'components/tile-grid/tile';
import TileGrid from 'components/tile-grid';

class JetpackOnboardingSiteTypeStep extends React.PureComponent {
	handleSiteTypeSelection = siteType => () => {
		this.props.recordJpoEvent( 'calypso_jpo_site_type_clicked', {
			site_type: siteType,
		} );
		this.props.saveJpoSettings( this.props.siteId, {
			siteType,
		} );
	};

	render() {
		const { getForwardUrl, settings, translate } = this.props;
		const headerText = translate( "Let's shape your new site." );
		const subHeaderText = translate( 'What kind of site do you need? Choose an option below:' );
		const forwardUrl = getForwardUrl();
		const siteType = get( settings, 'siteType' );

		return (
			<div className="steps__main" data-e2e-type="site-type">
				<FormattedHeader headerText={ headerText } subHeaderText={ subHeaderText } />

				<TileGrid>
					<Tile
						buttonLabel={ translate( 'Personal site' ) }
						description={ translate(
							'Share your ideas, stories, photographs, or creative projects with your followers.'
						) }
						image={ '/calypso/images/illustrations/type-personal.svg' }
						highlighted={ siteType === 'personal' }
						href={ forwardUrl }
						onClick={ this.handleSiteTypeSelection( 'personal' ) }
						e2eType={ 'personal' }
					/>
					<Tile
						buttonLabel={ translate( 'Business site' ) }
						description={ translate(
							'Promote your business, organization, or brand, sell products or services, or connect with your audience.'
						) }
						image={ '/calypso/images/illustrations/type-business.svg' }
						highlighted={ siteType === 'business' }
						href={ forwardUrl }
						onClick={ this.handleSiteTypeSelection( 'business' ) }
						e2eType={ 'business' }
					/>
				</TileGrid>
			</div>
		);
	}
}

export default localize( JetpackOnboardingSiteTypeStep );
