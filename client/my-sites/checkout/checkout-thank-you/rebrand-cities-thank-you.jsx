/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import React, { Component } from 'react';

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
								{ translate( 'Congratulations on taking steps to introduce or reintroduce your ' +
									'brand to the world. We commend you on starting this journey of establishing ' +
									'a digital footprint and reaching more customers.' ) }
							</p>
							<p>
								{ translate( 'Please complete our business survey so we can learn more about you ' +
									'and your business.' ) }
							</p>
						</div>
					}
					buttonUrl={ 'https://rebrandcities.typeform.com/to/cesv1j?typeform-welcome=0' }
					buttonText={ translate( 'Start our business survey' ) }
					icon={ this.renderLogo() }
					action={ null }
				/>
			</div>
		);
	}
}

export default localize( RebrandCitiesThankYou );
