/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';
import { get, map, reduce } from 'lodash';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import Gridicon from 'gridicons';
import { cartItems } from 'lib/cart-values';

class DomainRegistrationAgreement extends React.Component {
	static displayName = 'RegistrationAgreementLink';

	recordRefundsSupportClick = () => {
		analytics.ga.recordEvent( 'Upgrades', 'Clicked Registration Agreement Link' );
	};

	renderAgreementLink = ( url, domains ) => {
		const message = this.props.translate(
			'View the {{domainRegistrationAgreementLink}}Domain Registration Agreement{{/domainRegistrationAgreementLink}} for %(domainsList)s.',
			{
				args: {
					domainsList: domains.join( ', ' ),
				},
				components: {
					domainRegistrationAgreementLink: (
						<a
							href={ url }
							target="_blank"
							rel="noopener noreferrer"
							onClick={ this.recordRefundsSupportClick }
						/>
					),
				},
			}
		);

		return message;
	};

	getDomainsByRegistrationAgreement() {
		const domainRegistrations = cartItems.getDomainRegistrations( this.props.cart );
		const agreementUrls = [
			...new Set(
				map( domainRegistrations, registration =>
					get( registration, 'extra.domain_registration_agreement_url' )
				)
			),
		];
		return reduce(
			agreementUrls,
			( domainsByAgreement, url ) => {
				const domainsList = reduce(
					domainRegistrations,
					( domains, registration ) => {
						if ( registration.extra.domain_registration_agreement_url === url ) {
							domains.push( registration.meta );
						}
						return domains;
					},
					[]
				);
				domainsByAgreement.push( {
					url,
					domains: domainsList,
				} );
				return domainsByAgreement;
			},
			[]
		);
	}

	render() {
		if ( ! cartItems.hasDomainRegistration( this.props.cart ) ) {
			return null;
		}

		const domainRegistrations = cartItems.getDomainRegistrations( this.props.cart );
		const agreementsList = this.getDomainsByRegistrationAgreement( domainRegistrations );
		let key = 0;

		return (
			<div className="checkout__domain-registration-agreement-link">
				<Gridicon icon="info-outline" size={ 18 } />
				{ map( agreementsList, ( { url, domains } ) => (
					<p key={ key++ }>{ this.renderAgreementLink( url, domains ) }</p>
				) ) }
			</div>
		);
	}
}

export default localize( DomainRegistrationAgreement );
