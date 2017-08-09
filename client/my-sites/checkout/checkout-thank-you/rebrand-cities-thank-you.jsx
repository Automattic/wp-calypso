/**
 * External dependencies
 */
import React, { Component } from 'react';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';

class RebrandCitiesThankYou extends Component {
	render() {
		const { translate } = this.props;

		return (
			<div className="checkout-thank-you__header">
				<div className="checkout-thank-you__header-content">
					<span className="checkout-thank-you__header-icon">
						<Gridicon icon="trophy" size={ 72 } />
					</span>

					<div className="checkout-thank-you__header-copy">
						<h1 className="checkout-thank-you__header-heading">
							{ translate( 'Thank you for signing up!' ) }
						</h1>

						<h2 className="checkout-thank-you__header-text">
							{ translate( 'We will contact you shortly' ) }
						</h2>
					</div>
				</div>
			</div>
		);
	}
}

export default localize( RebrandCitiesThankYou );
