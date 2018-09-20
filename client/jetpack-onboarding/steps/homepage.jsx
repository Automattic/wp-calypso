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

class JetpackOnboardingHomepageStep extends React.PureComponent {
	handleHomepageSelection = homepageFormat => () => {
		this.props.recordJpoEvent( 'calypso_jpo_homepage_format_clicked', {
			homepage_format: homepageFormat,
		} );

		this.props.saveJpoSettings( this.props.siteId, {
			homepageFormat,
		} );
	};

	render() {
		const { getForwardUrl, settings, translate } = this.props;
		const headerText = translate( "Let's shape your new site." );
		const subHeaderText = translate( 'What should visitors see on your homepage?' );
		const forwardUrl = getForwardUrl();
		const homepageFormat = get( settings, 'homepageFormat' );

		return (
			<div className="steps__main" data-e2e-type="homepage">
				<FormattedHeader headerText={ headerText } subHeaderText={ subHeaderText } />

				<TileGrid>
					<Tile
						buttonLabel={ translate( 'Recent news or updates' ) }
						description={ translate(
							'We can pull the latest information into your homepage for you.'
						) }
						image={ '/calypso/images/illustrations/homepage-news.svg' }
						highlighted={ homepageFormat === 'posts' }
						href={ forwardUrl }
						onClick={ this.handleHomepageSelection( 'posts' ) }
						e2eType={ 'posts' }
					/>
					<Tile
						buttonLabel={ translate( 'A static welcome page' ) }
						description={ translate( 'Have your homepage stay the same as time goes on.' ) }
						image={ '/calypso/images/illustrations/homepage-static.svg' }
						highlighted={ homepageFormat === 'page' }
						href={ forwardUrl }
						onClick={ this.handleHomepageSelection( 'page' ) }
						e2eType={ 'page' }
					/>
				</TileGrid>
			</div>
		);
	}
}

export default localize( JetpackOnboardingHomepageStep );
