/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import ThankYouCard from 'components/thank-you-card';

class RebrandCitiesThankYou extends Component {
	renderLogo() {
		return <img src="/calypso/images/rebrand-cities/wp-rebrand-cities-logo.svg" />;
	}

	render() {
		const { translate } = this.props;

		return (
			<div className="plan-thank-you-card checkout-thank-you__rebrand-cities">
				<ThankYouCard
					name={ translate( 'Rebrand Cities package' ) }
					price="$299.00"
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
					buttonUrl={ 'https://rebrandcities.typeform.com/to/mbymUQ' }
					buttonText={ translate( 'Start our business survey' ) }
					icon={ this.renderLogo() }
					action={ null }
				/>
			</div>
		);
	}
}

export default localize( RebrandCitiesThankYou );
