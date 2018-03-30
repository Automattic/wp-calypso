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
import ActionCard from 'components/action-card';
import Main from 'components/main';
import { recordTracksEvent } from 'state/analytics/actions';
import ExternalLink from 'components/external-link';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { getSelectedSiteSlug } from 'state/ui/selectors';

class GoogleMyBusinessSelectBusinessType extends Component {
	static propTypes = {
		recordTracksEvent: PropTypes.func.isRequired,
		siteSlug: PropTypes.string.isRequired,
		translate: PropTypes.func.isRequired,
	};

	goBack = () => {
		page.back( `/stats/day/${ this.props.siteSlug }` );
	};

	trackCreateMyListingClick = () => {
		this.props.recordTracksEvent(
			'calypso_google_my_business_select_business_type_create_my_listing_button_click'
		);
	};

	trackOptimizeYourSEOClick = () => {
		this.props.recordTracksEvent(
			'calypso_google_my_business_select_business_type_optimize_your_seo_button_click'
		);
	};

	trackGoogleMyBusinessLinkClick = () => {
		this.props.recordTracksEvent(
			'calypso_google_my_business_select_business_type_google_my_business_link_click'
		);
	};

	render() {
		const { siteSlug, translate } = this.props;

		return (
			<Main className="gmb-select-business-type" wideLayout>
				<PageViewTracker
					path="/google-my-business/:site/select-business-type"
					title="Google My Business > Select Business Type"
				/>

				<HeaderCake isCompact={ false } alwaysShowActionText={ false } onClick={ this.goBack }>
					{ translate( 'Google My Business' ) }
				</HeaderCake>

				<Card className="gmb-select-business-type__explanation">
					<div className="gmb-select-business-type__explanation-main">
						<h1 className="gmb-select-business-type__heading">
							{ translate( 'Which type of business are you?' ) }
						</h1>

						<p>
							{ translate(
								'{{link}}Google My Business{{/link}} lists your local business on Google Search and Google Maps. ' +
								'It works for businesses that have a physical location or serve a local area.',
								{
									components: {
										link: (
											<ExternalLink
												href="https://www.google.com/business/"
												target="_blank"
												rel="noopener noreferrer"
												icon={ true }
												onClick={ this.trackGoogleMyBusinessLinkClick }
											/>
										),
									},
								}
							) }
						</p>
					</div>

					<img
						className="gmb-select-business-type__illustration"
						src="/calypso/images/google-my-business/business-local.svg"
						alt={ translate( 'Local business illustration' ) }
					/>
				</Card>

				<ActionCard
					headerText={ translate( 'Physical Location or Service Area', {
						comment: 'In the context of a business activity, brick and mortar or online service',
					} ) }
					mainText={ translate(
						'Your business has a physical location customers can visit, ' +
						'or provides goods and services to local customers, or both.'
					) }
					buttonText={ translate( 'Create Your Listing', {
						comment: 'Call to Action to add a business listing to Google My Business',
					} ) }
					buttonIcon="external"
					buttonPrimary={ true }
					buttonHref="https://www.google.com/business/"
					buttonTarget="_blank"
					buttonOnClick={ this.trackCreateMyListingClick }
				/>

				<ActionCard
					headerText={ translate( 'Online Only', {
						comment: 'In the context of a business activity, as opposed to a brick and mortar',
					} ) }
					mainText={ translate(
						"Don't provide in-person services? Learn more about reaching your customers online."
					) }
					buttonText={ translate( 'Optimize Your SEO', { comment: 'Call to Action button' } ) }
					buttonHref={ `/settings/traffic/${ siteSlug }` }
					buttonOnClick={ this.trackOptimizeYourSEOClick }
				/>
			</Main>
		);
	}
}

export default connect(
	state => ( {
		siteSlug: getSelectedSiteSlug( state ),
	} ),
	{
		recordTracksEvent,
	}
)( localize( GoogleMyBusinessSelectBusinessType ) );
