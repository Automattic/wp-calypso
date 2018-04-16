/** @format */

/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import ActionCard from 'components/action-card';
import Card from 'components/card';
import CardHeading from 'components/card-heading';
import config from 'config';
import DocumentHead from 'components/data/document-head';
import ExternalLink from 'components/external-link';
import { getSelectedSiteSlug } from 'state/ui/selectors';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { recordTracksEvent } from 'state/analytics/actions';

class GoogleMyBusinessSelectBusinessType extends Component {
	static propTypes = {
		recordTracksEvent: PropTypes.func.isRequired,
		siteSlug: PropTypes.string.isRequired,
		translate: PropTypes.func.isRequired,
	};

	goBack = () => {
		page.back( `/stats/day/${ this.props.siteSlug }` );
	};

	trackCreateYourListingClick = () => {
		this.props.recordTracksEvent(
			'calypso_google_my_business_select_business_type_create_my_listing_button_click'
		);
	};

	trackOptimizeYourSEOClick = () => {
		this.props.recordTracksEvent(
			'calypso_google_my_business_select_business_type_optimize_your_seo_button_click'
		);
	};

	trackGoogleMyBusinessClick = () => {
		this.props.recordTracksEvent(
			'calypso_google_my_business_select_business_type_google_my_business_link_click'
		);
	};

	renderLocalBusinessCard() {
		const { siteSlug, translate } = this.props;

		let buttonProps = {};

		if ( config.isEnabled( 'google-my-business' ) ) {
			buttonProps = {
				buttonHref: `/google-my-business/new/${ siteSlug }`,
				buttonText: translate( 'Continue With Google', {
					comment: 'Call to Action to connect to Google My Business',
				} ),
			};
		} else {
			buttonProps = {
				buttonHref: 'https://business.google.com/create',
				buttonIcon: 'external',
				buttonTarget: '_blank',
				buttonText: translate( 'Create Your Listing', {
					comment: 'Call to Action to add a business listing to Google My Business',
				} ),
			};
		}

		return (
			<ActionCard
				headerText={ translate( 'Physical Location or Service Area', {
					comment: 'In the context of a business activity, brick and mortar or online service',
				} ) }
				mainText={ translate(
					'Your business has a physical location customers can visit, ' +
					'or provides goods and services to local customers, or both.'
				) }
				buttonPrimary={ true }
				buttonOnClick={ this.trackCreateYourListingClick }
				{ ...buttonProps }
			/>
		);
	}

	renderOnlineBusinessCard() {
		const { siteSlug, translate } = this.props;

		return (
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
		);
	}

	render() {
		const { translate } = this.props;

		return (
			<Main className="gmb-select-business-type" wideLayout>
				<PageViewTracker
					path="/google-my-business/select-business-type/:site"
					title="Google My Business > Select Business Type"
				/>

				<DocumentHead title={ translate( 'Google My Business' ) } />

				<HeaderCake isCompact={ false } alwaysShowActionText={ false } onClick={ this.goBack }>
					{ translate( 'Google My Business' ) }
				</HeaderCake>

				<Card className="gmb-select-business-type__explanation">
					<div className="gmb-select-business-type__explanation-main">
						<CardHeading tagName="h1" size={ 24 }>
							{ translate( 'Which type of business are you?' ) }
						</CardHeading>

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
												onClick={ this.trackGoogleMyBusinessClick }
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

				{ this.renderLocalBusinessCard() }

				{ this.renderOnlineBusinessCard() }
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
