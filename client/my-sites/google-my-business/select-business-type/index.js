/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import HeaderCake from 'components/header-cake';
import Card from 'components/card';
import CTACard from './cta-card';
import { recordTracksEvent } from 'state/analytics/actions';

class SelectBusinessType extends Component {
	static propTypes = {
		translate: PropTypes.func.isRequired,
		siteId: PropTypes.string.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
	};

	trackMyListingClick = () => {
		this.props.recordTracksEvent( 'calypso_google_my_business_create_my_listing_click' );
	};

	trackOptimizeYourSEOClicked = () => {
		this.props.recordTracksEvent( 'calypso_google_my_business_optimize_your_seo_click' );
	};

	goBack = () => {
		page.back( `/stats/day/${ this.props.siteId }` );
	};

	render() {
		const { translate, siteId } = this.props;

		return (
			<div className="select-business-type">
				<HeaderCake isCompact={ false } alwaysShowActionText={ false } onClick={ this.goBack }>
					{ translate( 'Google My Business' ) }
				</HeaderCake>
				<Card className="select-business-type__explanation">
					<div className="select-business-type__explanation-main">
						<h1>{ translate( 'Which type of business are you?' ) }</h1>
						<h2>
							{ translate(
								'Google My Business lists your local business on Google Search and Google Maps. ' +
									'It works for businesses that have a physical location or serve a local area.'
							) }
						</h2>
					</div>
					<img
						src="/calypso/images/google-my-business/business-local.svg"
						alt="Local business illustration"
					/>
				</Card>

				<CTACard
					headerText={ translate( 'Physical Location or Service Area' ) }
					mainText={ translate(
						'My business has a physical location customers can visit, ' +
							'or provides goods and services to local customers, or both.'
					) }
					buttonText={ translate( 'Create My Listing' ) }
					buttonIcon="external"
					buttonPrimary={ true }
					buttonHref="https://www.google.com/business/"
					buttonTarget="_blank"
					buttonOnClick={ this.trackMyListingClick }
				/>

				<CTACard
					headerText={ translate( 'Online Only' ) }
					mainText={ translate(
						"Don't provide in-person services? Learn more about reaching your customers online."
					) }
					buttonText={ translate( 'Optimize Your SEO' ) }
					buttonIcon="external"
					buttonHref={ '/settings/traffic/' + siteId }
					buttonTarget="_blank"
					buttonOnClick={ this.trackOptimizeYourSEOClicked }
				/>
			</div>
		);
	}
}

export default connect( undefined, { recordTracksEvent } )( localize( SelectBusinessType ) );
