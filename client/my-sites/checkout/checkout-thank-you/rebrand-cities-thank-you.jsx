/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import ThankYouCard from 'components/thank-you-card';

class RebrandCitiesThankYou extends Component {
	renderLogo() {
		return <img src="/calypso/images/rebrand-cities/wp-rebrand-cities-logo.svg" />;
	}

	render() {
		const { receipt, translate } = this.props;
		const displayPrice = get( receipt, 'data.displayPrice' );

		return (
			<div className="plan-thank-you-card checkout-thank-you__rebrand-cities">
				<ThankYouCard
					name={ translate( 'Rebrand Cities package' ) }
					price={ displayPrice }
					heading={ translate( 'Your acccount has been created' ) }
					descriptionWithHTML={
						<div>
							<p>
								{ translate(
									'Congratulations on taking steps to introduce or reintroduce your ' +
										'brand to the world. We commend you on starting this journey of establishing ' +
										'a digital footprint and reaching more customers.'
								) }
							</p>
						</div>
					}
					icon={ this.renderLogo() }
					action=" "
				/>
			</div>
		);
	}
}

export default localize( RebrandCitiesThankYou );
