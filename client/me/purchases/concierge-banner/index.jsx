import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { Banner } from 'calypso/components/banner';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import {
	CONCIERGE_HAS_AVAILABLE_INCLUDED_SESSION,
	CONCIERGE_HAS_AVAILABLE_PURCHASED_SESSION,
	CONCIERGE_HAS_UPCOMING_APPOINTMENT,
} from 'calypso/me/concierge/constants';
import './style.scss';

class ConciergeBanner extends Component {
	static propTypes = {
		bannerType: PropTypes.oneOf( [
			CONCIERGE_HAS_UPCOMING_APPOINTMENT,
			CONCIERGE_HAS_AVAILABLE_INCLUDED_SESSION,
			CONCIERGE_HAS_AVAILABLE_PURCHASED_SESSION,
		] ).isRequired,
		sites: PropTypes.array.isRequired,
	};

	placeholder() {
		return (
			<Card compact={ false }>
				<div className="concierge-banner__placeholders is-placeholder">
					<div className="concierge-banner__placeholder-row-container is-placeholder">
						<div className="concierge-banner__placeholder-row is-placeholder" />
						<div className="concierge-banner__placeholder-row is-placeholder" />
						<div className="concierge-banner__placeholder-row is-placeholder" />
					</div>
					<div className="concierge-banner__placeholder-button-container">
						<div className="concierge-banner__placeholder-button is-placeholder" />
					</div>
				</div>
			</Card>
		);
	}

	getBannerContent() {
		const { bannerType, translate } = this.props;

		let title;
		let description;
		let buttonText;

		switch ( bannerType ) {
			case CONCIERGE_HAS_UPCOMING_APPOINTMENT:
				title = translate( 'Your Quick Start session appointment is coming up!' );
				description = translate(
					'Get ready with your questions for your upcoming {{supportLink}}Quick Start support session{{/supportLink}} appointment. A Quick Start session is a one-on-one video session between the user and our support staff.',
					{
						components: {
							supportLink: (
								<a
									target={ '_blank' }
									rel={ 'noreferrer' }
									href="https://wordpress.com/discover-wordpress/2019/03/21/getting-the-most-out-of-our-business-concierge-service/"
								/>
							),
						},
					}
				);
				buttonText = translate( 'Session dashboard' );
				break;
			case CONCIERGE_HAS_AVAILABLE_PURCHASED_SESSION:
			case CONCIERGE_HAS_AVAILABLE_INCLUDED_SESSION:
				title = translate( 'You have unused Quick Start support sessions' );
				description = translate(
					`You are eligible for one-to-one {{supportLink}}Quick Start support sessions{{/supportLink}} with one of our friendly Happiness Engineers, from our now {{quickStartLink}}retired service{{/quickStartLink}}. You can us these sessions to get expert advice, tips and resources on site setup.`,
					{
						components: {
							supportLink: (
								<a
									target={ '_blank' }
									rel={ 'noreferrer' }
									href="https://wordpress.com/discover-wordpress/2019/03/21/getting-the-most-out-of-our-business-concierge-service/"
								/>
							),
							quickStartLink: (
								<a
									target={ '_blank' }
									rel={ 'noreferrer' }
									href="https://wordpress.com/support/quickstart-support/"
								/>
							),
						},
					}
				);
				buttonText = translate( 'Schedule a date' );
				break;
		}

		return { title, description, buttonText };
	}

	render() {
		const { bannerType, showPlaceholder, nextAppointmentSiteId, siteId, sites } = this.props;

		// if no appointment and not on a site then use the first site with a session available
		// e.g. when viewing at /me/purchases
		const quickStartSite = nextAppointmentSiteId || siteId || sites[ 0 ];

		if ( showPlaceholder ) {
			return this.placeholder();
		}

		const { buttonText, description, title } = this.getBannerContent();

		return (
			<>
				<TrackComponentView eventName="calypso_purchases_concierge_banner_view" />
				<Banner
					callToAction={ buttonText }
					description={ description }
					dismissPreferenceName={ `quick-start-banner-${ bannerType }` }
					href={ `/me/quickstart/${ quickStartSite }` }
					title={ title }
					tracksClickName={ 'calypso_purchases_concierge_banner_click' }
				/>
			</>
		);
	}
}

export default localize( ConciergeBanner );
