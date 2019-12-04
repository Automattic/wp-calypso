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

class ConciergeBanner extends Component {
	render() {
		return (
			<>
				<TrackComponentView eventName="calypso_purchases_concierge_banner_view" />
				<ActionCard
					headerText={ this.props.translate( 'Looking for Expert Help?' ) }
					mainText={ this.props.translate(
						'Get 30 minutes dedicated to the success of your site. Schedule your free 1-1 Quick Start Session with a Happiness Engineer!',
						{
							comment:
								"Please extend the translation so that it's clear that these sessions are only available in English.",
						}
					) }
					buttonText={ this.props.translate( 'Schedule Now' ) }
					buttonIcon={ null }
					buttonPrimary={ true }
					buttonHref="/me/concierge"
					buttonTarget={ null }
					buttonOnClick={ () => {
						this.props.recordTracksEvent( 'calypso_purchases_concierge_banner_click', {
							referer: '/me/purchases',
						} );
					} }
					compact={ false }
					illustration="/calypso/images/illustrations/illustration-start.svg"
				/>
			</>
		);
	}
}

export default localize( ConciergeBanner );
