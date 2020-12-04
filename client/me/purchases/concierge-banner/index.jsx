/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import classnames from 'classnames';
import PropTypes from 'prop-types';

/**
 * Internal Dependencies
 */
import { Card } from '@automattic/components';
import ActionCard from 'calypso/components/action-card';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import conciergeImage from 'calypso/assets/images/illustrations/jetpack-concierge.svg';
import {
	CONCIERGE_HAS_UPCOMING_APPOINTMENT,
	CONCIERGE_HAS_AVAILABLE_INCLUDED_SESSION,
	CONCIERGE_HAS_AVAILABLE_PURCHASED_SESSION,
	CONCIERGE_SUGGEST_PURCHASE_CONCIERGE,
} from 'calypso/me/concierge/constants';

/**
 * Style dependencies
 */
import './style.scss';

class ConciergeBanner extends Component {
	static propTypes = {
		bannerType: PropTypes.oneOf( [
			CONCIERGE_HAS_UPCOMING_APPOINTMENT,
			CONCIERGE_HAS_AVAILABLE_INCLUDED_SESSION,
			CONCIERGE_HAS_AVAILABLE_PURCHASED_SESSION,
			CONCIERGE_SUGGEST_PURCHASE_CONCIERGE,
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
				buttonHref = '/me/concierge';
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
				buttonHref = '/me/concierge';
				illustrationUrl = conciergeImage;
				break;

			case CONCIERGE_HAS_AVAILABLE_PURCHASED_SESSION:
				headerText = translate( 'Our experts are waiting to help you' );
				mainText = translate( 'Schedule your 1-1 Quick Start Session with a Happiness Engineer!', {
					comment:
						'Quick Start Session is a one-on-one video session between the user and our support staff.',
				} );
				buttonText = translate( 'Schedule now' );
				buttonHref = '/me/concierge';
				illustrationUrl = conciergeImage;
				break;

			case CONCIERGE_SUGGEST_PURCHASE_CONCIERGE:
				headerText = translate( 'Need an expert by your side?' );
				mainText = translate(
					'We offer one-on-one Quick Start sessions dedicated to your site’s success. Click the button to learn how we can help you during these %(durationInMinutes)d minute calls.',
					{
						comment:
							'Quick Start Session is a one-on-one video session between the user and our support staff.',
						args: { durationInMinutes: 30 },
					}
				);
				buttonText = translate( 'Learn more' );
				buttonHref = '/checkout/offer-quickstart-session';
				illustrationUrl = '/calypso/images/illustrations/illustration-start.svg';
				break;
		}

		return { headerText, mainText, buttonText, buttonHref, illustrationUrl };
	}

	render() {
		const { bannerType, showPlaceholder } = this.props;

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

		const className = classnames( 'concierge-banner', {
			'purchase-concierge': CONCIERGE_SUGGEST_PURCHASE_CONCIERGE === bannerType,
		} );

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
					classNames={ className }
				/>
			</>
		);
	}
}

export default localize( ConciergeBanner );
