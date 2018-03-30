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
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import { recordPageViewWithClientId as recordPageView, recordTracksEvent } from 'state/analytics/actions';

class GoogleMyBusinessNewAccount extends Component {
	static propTypes = {
		recordTracksEvent: PropTypes.func.isRequired,
		siteId: PropTypes.string.isRequired,
		translate: PropTypes.func.isRequired,
	};

	componentDidMount() {
		this.props.recordPageView( '/google-my-business/:site/new', 'Google My Business > New' );
	}

	goBack = () => {
		page.back( `/google-my-business/${ this.props.siteId }` );
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
		const { translate } = this.props;

		return (
			<Main className="gmb-new-account" wideLayout>
				<HeaderCake isCompact={ false } alwaysShowActionText={ false } onClick={ this.goBack }>
					{ translate( 'Google My Business' ) }
				</HeaderCake>

				<Card className="gmb-new-account__card">
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
						<Button primary onClick={ this.trackCreateMyListingClick }>
							{ translate( 'Create My Listing' ) }
						</Button>

						<Button href={ `/stats/${ this.props.siteId }` } onClick={ this.trackNoThanksClick }>
							{ translate( 'No thanks' ) }
						</Button>
					</div>
				</Card>
			</Main>
		);
	}
}

export default connect( undefined, { recordPageView, recordTracksEvent } )( localize( GoogleMyBusinessNewAccount ) );
