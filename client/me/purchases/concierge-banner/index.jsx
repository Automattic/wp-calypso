import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import conciergeImage from 'calypso/assets/images/illustrations/jetpack-concierge.svg';
import ActionCard from 'calypso/components/action-card';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import {
	CONCIERGE_HAS_UPCOMING_APPOINTMENT,
	CONCIERGE_HAS_AVAILABLE_INCLUDED_SESSION,
	CONCIERGE_HAS_AVAILABLE_PURCHASED_SESSION,
} from 'calypso/me/concierge/constants';

import './style.scss';

class ConciergeBanner extends Component {
	static propTypes = {
		bannerType: PropTypes.oneOf( [
			CONCIERGE_HAS_UPCOMING_APPOINTMENT,
			CONCIERGE_HAS_AVAILABLE_INCLUDED_SESSION,
			CONCIERGE_HAS_AVAILABLE_PURCHASED_SESSION,
		] ).isRequired,
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

		let headerText;
		let mainText;
		let buttonText;
		let buttonHref;
		let illustrationUrl;

		switch ( bannerType ) {
			case CONCIERGE_HAS_UPCOMING_APPOINTMENT:
				headerText = translate( 'Your appointment is coming up!' );
				mainText = translate(
					'Get ready with your questions for your upcoming Quick Start session appointment.',
					{
						comment:
							'Quick Start Session is a one-on-one video session between the user and our support staff.',
					}
				);
				buttonText = translate( 'Session dashboard' );
				buttonHref = '/me/quickstart';
				illustrationUrl = conciergeImage;
				break;

			case CONCIERGE_HAS_AVAILABLE_INCLUDED_SESSION:
				headerText = translate( 'Looking for Expert Help?' );
				mainText = translate(
					'Get %(durationInMinutes)d minutes dedicated to the success of your site. Schedule your free 1-1 Quick Start Session with a Happiness Engineer!',
					{
						comment:
							'Quick Start Session is a one-on-one video session between the user and our support staff.',
						args: { durationInMinutes: 30 },
					}
				);
				buttonText = translate( 'Schedule now' );
				buttonHref = '/me/quickstart';
				illustrationUrl = conciergeImage;
				break;

			case CONCIERGE_HAS_AVAILABLE_PURCHASED_SESSION:
				headerText = translate( 'Our experts are waiting to help you' );
				mainText = translate( 'Schedule your 1-1 Quick Start Session with a Happiness Engineer!', {
					comment:
						'Quick Start Session is a one-on-one video session between the user and our support staff.',
				} );
				buttonText = translate( 'Schedule now' );
				buttonHref = '/me/quickstart';
				illustrationUrl = conciergeImage;
				break;
		}

		return { headerText, mainText, buttonText, buttonHref, illustrationUrl };
	}

	render() {
		const { showPlaceholder } = this.props;

		if ( showPlaceholder ) {
			return this.placeholder();
		}

		const {
			headerText,
			mainText,
			buttonText,
			buttonHref,
			illustrationUrl,
		} = this.getBannerContent();

		return (
			<>
				<TrackComponentView eventName="calypso_purchases_concierge_banner_view" />
				<ActionCard
					headerText={ headerText }
					mainText={ mainText }
					buttonText={ buttonText }
					buttonIcon={ null }
					buttonPrimary={ true }
					buttonHref={ buttonHref }
					buttonTarget={ null }
					buttonOnClick={ () => {
						this.props.recordTracksEvent( 'calypso_purchases_concierge_banner_click', {
							referer: '/me/purchases',
						} );
					} }
					compact={ false }
					illustration={ illustrationUrl }
					classNames="concierge-banner"
				/>
			</>
		);
	}
}

export default localize( ConciergeBanner );
