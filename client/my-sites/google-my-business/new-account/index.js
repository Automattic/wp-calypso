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
import Button from 'components/button';
import Card from 'components/card';
import DocumentHead from 'components/data/document-head';
import { getSelectedSiteSlug } from 'state/ui/selectors';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { recordTracksEvent } from 'state/analytics/actions';

class GoogleMyBusinessNewAccount extends Component {
	static propTypes = {
		recordTracksEvent: PropTypes.func.isRequired,
		siteSlug: PropTypes.string.isRequired,
		translate: PropTypes.func.isRequired,
	};

	goBack = () => {
		page.back( `/google-my-business/select-business-type/${ this.props.siteSlug }` );
	};

	trackCreateMyListingClick = () => {
		this.props.recordTracksEvent(
			'calypso_google_my_business_new_account_create_my_listing_button_click'
		);
	};

	trackNoThanksClick = () => {
		this.props.recordTracksEvent(
			'calypso_google_my_business_new_account_no_thanks_button_click'
		);
	};

	render() {
		const { siteSlug, translate } = this.props;

		return (
			<Main className="gmb-new-account" wideLayout>
				<PageViewTracker
					path="/google-my-business/new/:site"
					title="Google My Business > New"
				/>

				<DocumentHead title={ translate( 'Google My Business' ) } />

				<HeaderCake isCompact={ false } alwaysShowActionText={ false } onClick={ this.goBack }>
					{ translate( 'Google My Business' ) }
				</HeaderCake>

				<Card>
					<div className="gmb-new-account__wrapper">
						<img
							alt={ translate( 'Local business illustration' ) }
							className="gmb-new-account__illustration"
							src="/calypso/images/google-my-business/business-local.svg"
						/>

						<h1 className="gmb-new-account__heading">
							{ translate( 'It looks like you might be new to Google My Business' ) }
						</h1>

						<p>
							{ translate(
								'Google My Business lists your local business on Google Search and Google Maps. ' +
									'It works for businesses that have a physical location or serve a local area'
							) }
						</p>

						<div className="gmb-new-account__actions">
							<Button
								href={ `/google-my-business/select-location/${ siteSlug }` }
								onClick={ this.trackCreateMyListingClick }
								primary
							>
								{ translate( 'Create Your Listing' ) }
							</Button>

							<Button
								href={ `/stats/${ siteSlug }` }
								onClick={ this.trackNoThanksClick }
							>
								{ translate( 'No thanks' ) }
							</Button>
						</div>
					</div>
				</Card>
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
)( localize( GoogleMyBusinessNewAccount ) );
