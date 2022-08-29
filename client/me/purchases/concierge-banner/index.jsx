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
				title = translate( 'Your session is coming up soon' );
				description = translate(
					'Your {{supportLink}}Quick Start support session{{/supportLink}} is approaching. Get ready for your one-to-one with our Happiness Engineer.',
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
				title = translate( 'You still have a Quick Start session available' );
				description = translate(
					`Schedule your {{supportLink}}Quick Start support session{{/supportLink}} and get one-on-one guidance from our expert Happiness Engineers to kickstart your site!.`,
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
				buttonText = translate( 'Schedule a date' );
				break;
		}

		return { title, description, buttonText };
	}

	render() {
		const { bannerType, showPlaceholder, nextAppointmentSiteId, siteId, availableSessions } =
			this.props;

		// if no appointment and not on a site then use the first site with a session available
		// e.g. when viewing at /me/purchases
		const quickStartSite = nextAppointmentSiteId || siteId || availableSessions[ 0 ];

		if ( showPlaceholder ) {
			return this.placeholder();
		}

		const { buttonText, description, title } = this.getBannerContent();

		return (
			<>
				<TrackComponentView eventName="calypso_purchases_concierge_banner_view" />
				<Banner
					showIcon={ false }
					primaryButton={ false }
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
