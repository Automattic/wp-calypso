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
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import Tile from 'components/tile-grid/tile';
import TileGrid from 'components/tile-grid';
import { JETPACK_ONBOARDING_STEPS as STEPS } from '../constants';

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
		const { basePath, getForwardUrl, settings, translate } = this.props;
		const headerText = translate( "Let's shape your new site." );
		const subHeaderText = translate( 'What kind of site do you need? Choose an option below:' );
		const forwardUrl = getForwardUrl();
		const siteType = get( settings, 'siteType' );

		return (
			<div className="steps__main">
				<DocumentHead title={ translate( 'Site Type ‹ Jetpack Start' ) } />
				<PageViewTracker
					path={ [ basePath, STEPS.SITE_TYPE, ':site' ].join( '/' ) }
					title="Site Type ‹ Jetpack Start"
				/>

				<FormattedHeader headerText={ headerText } subHeaderText={ subHeaderText } />

				<TileGrid>
					<Tile
						buttonLabel={ translate( 'Personal site' ) }
						description={ translate(
							'To share your ideas, stories, photographs, or creative projects with your followers.'
						) }
						image={ '/calypso/images/illustrations/type-personal.svg' }
						highlighted={ siteType === 'personal' }
						href={ forwardUrl }
						onClick={ this.handleSiteTypeSelection( 'personal' ) }
					/>
					<Tile
						buttonLabel={ translate( 'Business site' ) }
						description={ translate(
							'To promote your business, organization, or brand, sell products or services, or connect with your audience.'
						) }
						image={ '/calypso/images/illustrations/type-business.svg' }
						highlighted={ siteType === 'business' }
						href={ forwardUrl }
						onClick={ this.handleSiteTypeSelection( 'business' ) }
					/>
				</TileGrid>
			</div>
		);
	}
}

export default localize( JetpackOnboardingSiteTypeStep );
