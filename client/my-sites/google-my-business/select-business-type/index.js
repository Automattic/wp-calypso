/**
 * External dependencies
 *
 * @format
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import HeaderCake from 'components/header-cake';
import Card from 'components/card';
import CTACard from './cta-card';

class SelectBusinessType extends Component {
	render() {
		const { translate } = this.props;

		return (
			<div className="select-business-type">
				<HeaderCake isCompact={ false } alwaysShowActionText={ false }>
					{ translate( 'Google My Business' ) }
				</HeaderCake>
				<Card className="select-business-type__explanation">
					<div className="select-business-type__explanation-main">
						<h1>{ translate( 'Which type of business are you?' ) }</h1>
						<h2>
							{ translate(
								'Google My Business lists your local business on Google Search and Google Maps. ' +
									'It works for businesses that have a physical location or serve a local area.'
							) }
						</h2>
					</div>
					<img
						src="/calypso/images/google-my-business/business-local.svg"
						alt="Local business illustration"
					/>
				</Card>

				<CTACard
					headerText={ translate( 'Physical Location or Service Area' ) }
					mainText={ translate(
						'My business has a physical location custmers can visit, ' +
							'or provides goods and services to local customers, or both.'
					) }
					buttonText={ translate( 'Create My Listing' ) }
					buttonIcon="external"
					buttonPrimary={ true }
				/>

				<CTACard
					headerText={ translate( 'Online Only' ) }
					mainText={ translate(
						"Don't provide in-person services? Learn more about reaching your customers online."
					) }
					buttonText={ translate( 'Optimize Your SEO' ) }
					buttonIcon="external"
				/>
			</div>
		);
	}
}

export default localize( SelectBusinessType );
