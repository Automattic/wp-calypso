/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import ActionCard from 'components/action-card';
import { recordTracksEvent } from 'state/analytics/actions';

class ConciergeBanner extends Component {
	componentDidMount() {
		recordTracksEvent( 'calypso_purchases_concierge_banner_view', {
			referer: '/me/purchases',
		} );
	}

	render() {
		return (
			<ActionCard
				headerText={ this.props.translate( 'Looking for Expert Help?' ) }
				mainText={ this.props.translate(
					'Get 30 minutes dedicated to the success of your site. Schedule your free 1-1 concierge session with a Happiness Engineer!'
				) }
				buttonText="Schedule Now"
				buttonIcon={ null }
				buttonPrimary={ true }
				buttonHref="/me/concierge"
				buttonTarget={ null }
				buttonOnClick={ () => {
					recordTracksEvent( 'calypso_purchases_concierge_banner_click', {
						referer: '/me/purchases',
					} );
				} }
				compact={ false }
				illustration="/calypso/images/illustrations/illustration-start.svg"
			/>
		);
	}
}

export default localize( ConciergeBanner );
