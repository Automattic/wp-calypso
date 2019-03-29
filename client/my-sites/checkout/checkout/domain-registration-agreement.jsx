/** @format */

/**
 * External dependencies
 */

import React, { Fragment } from 'react';
import { localize } from 'i18n-calypso';
import { get, map, reduce } from 'lodash';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import Gridicon from 'gridicons';
import { cartItems } from 'lib/cart-values';

class DomainRegistrationAgreement extends React.Component {
	recordRegistrationAgreementClick = () => {
		analytics.ga.recordEvent( 'Upgrades', 'Clicked Registration Agreement Link' );
	};

	renderAgreementLinkForList = ( url, domains ) => {
		return this.props.translate(
			'View the {{domainRegistrationAgreementLink}}Domain Registration Agreement{{/domainRegistrationAgreementLink}} for %(domainsList)s.',
			{
				args: {
					domainsList: domains.join( ', ' ).replace( /, ([^,]*)$/, ' and $1' ),
				},
				components: {
					domainRegistrationAgreementLink: (
						<a
							href={ url }
							target="_blank"
							rel="noopener noreferrer"
							onClick={ this.recordRegistrationAgreementClick }
						/>
					),
				},
			}
		);
	};

	renderMultipleAgreements = agreementsList => {
		const preamble = this.props.translate(
			'You agree to the following domain name registration agreements:'
		);
		let key = 0;
		return (
			<Fragment>
				<p>{ preamble }</p>
				{ map( agreementsList, ( { url, domains } ) => (
					<p key={ key++ }>{ this.renderAgreementLinkForList( url, domains ) }</p>
				) ) }
			</Fragment>
		);
	};

	renderSingleAgreement = ( { url, domains } ) => {
		return (
			<p>
				{ this.props.translate(
					'You agree to the {{domainRegistrationAgreementLink}}Domain Registration Agreement{{/domainRegistrationAgreementLink}} for %(domainsList)s.',
					{
						args: {
							domainsList: domains.join( ', ' ).replace( /, ([^,]*)$/, ' and $1' ),
						},
						components: {
							domainRegistrationAgreementLink: (
								<a
									href={ url }
									target="_blank"
									rel="noopener noreferrer"
									onClick={ this.recordRegistrationAgreementClick }
								/>
							),
						},
					}
				) }
			</p>
		);
	};

	renderAgreements = () => {
		const domainRegistrations = cartItems.getDomainRegistrations( this.props.cart );
		const agreementsList = this.getDomainsByRegistrationAgreement( domainRegistrations );

		if ( agreementsList.length > 1 ) {
			return this.renderMultipleAgreements( agreementsList );
		}

		return this.renderSingleAgreement( agreementsList.shift() );
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

		return (
			<div className="checkout__domain-registration-agreement-link">
				<Gridicon icon="info-outline" size={ 18 } />
				{ this.renderAgreements() }
			</div>
		);
	}
}

export default localize( DomainRegistrationAgreement );
