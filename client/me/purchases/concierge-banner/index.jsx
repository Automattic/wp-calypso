/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import ActionCard from 'components/action-card';
import TrackComponentView from 'lib/analytics/track-component-view';
import conciergeImage from 'assets/images/illustrations/jetpack-concierge.svg';

class ConciergeBanner extends Component {
	getText() {
		const { bannerType } = this.props;

		let headerText, mainText, buttonText, buttonHref, illustrationUrl;

		switch ( bannerType ) {
			case 'upcomingAppointment':
				headerText = this.props.translate( 'Your appointment is coming up!' );
				mainText = this.props.translate(
					'Get ready with your questions for your upcoming Quick Start session appointment.',
					{
						comment:
							"Please extend the translation so that it's clear that these sessions are only available in English.",
					}
				);
				buttonText = this.props.translate( 'Session dashboard' );
				buttonHref = '/me/concierge';
				illustrationUrl = conciergeImage;
				break;

			case 'availableIncludedSession':
				headerText = this.props.translate( 'Looking for Expert Help?' );
				mainText = this.props.translate(
					'Get 30 minutes dedicated to the success of your site. Schedule your free 1-1 Quick Start Session with a Happiness Engineer!',
					{
						comment:
							"Please extend the translation so that it's clear that these sessions are only available in English.",
					}
				);
				buttonText = this.props.translate( 'Schedule Now' );
				buttonHref = '/me/concierge';
				illustrationUrl = conciergeImage;
				break;

			case 'availablePurchasedSession':
				headerText = this.props.translate( 'Our experts are waiting to help you' );
				mainText = this.props.translate(
					'Schedule your 45-minute 1-1 Quick Start Session with a Happiness Engineer!',
					{
						comment:
							"Please extend the translation so that it's clear that these sessions are only available in English.",
					}
				);
				buttonText = this.props.translate( 'Schedule Now' );
				buttonHref = '/me/concierge';
				illustrationUrl = conciergeImage;
				break;

			case 'canPurchaseConcierge':
				headerText = this.props.translate( 'Looking for Expert Help?' );
				mainText = this.props.translate(
					'Get 45 minutes dedicated to the success of your site. Purchase a 1-1 Quick Start Session with a Happiness Engineer!',
					{
						comment:
							"Please extend the translation so that it's clear that these sessions are only available in English.",
					}
				);
				buttonText = this.props.translate( 'Purchase Now' );
				buttonHref = '/checkout/offer-quickstart-session';
				illustrationUrl = '/calypso/images/illustrations/illustration-start.svg';
				break;
		}

		return { headerText, mainText, buttonText, buttonHref, illustrationUrl };
	}

	render() {
		const { headerText, mainText, buttonText, buttonHref, illustrationUrl } = this.getText();

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
				/>
			</>
		);
	}
}

export default localize( ConciergeBanner );
