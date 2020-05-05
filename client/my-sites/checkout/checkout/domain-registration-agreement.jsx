/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { localize } from 'i18n-calypso';
import { get, map, reduce } from 'lodash';

/**
 * Internal dependencies
 */
import { gaRecordEvent } from 'lib/analytics/ga';
import Gridicon from 'components/gridicon';
import {
	getDomainRegistrations,
	getDomainTransfers,
	hasDomainRegistration,
	hasTransferProduct,
} from 'lib/cart-values/cart-items';

class DomainRegistrationAgreement extends React.Component {
	recordRegistrationAgreementClick = () => {
		gaRecordEvent( 'Upgrades', 'Clicked Registration Agreement Link' );
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

	renderMultipleAgreements = ( agreementsList ) => {
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
		const agreementsList = this.getDomainsByRegistrationAgreement();

		if ( agreementsList.length > 1 ) {
			return this.renderMultipleAgreements( agreementsList );
		}

		return this.renderSingleAgreement( agreementsList.shift() );
	};

	getDomainsByRegistrationAgreement() {
		const { cart } = this.props;
		const domainItems = getDomainRegistrations( cart );
		domainItems.push( ...getDomainTransfers( cart ) );
		const agreementUrls = [
			...new Set(
				map( domainItems, ( registration ) =>
					get( registration, 'extra.domain_registration_agreement_url' )
				)
			),
		];

		return reduce(
			agreementUrls,
			( domainsByAgreement, url ) => {
				const domainsList = reduce(
					domainItems,
					( domains, domainItem ) => {
						if ( domainItem.extra.domain_registration_agreement_url === url ) {
							domains.push( domainItem.meta );
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
		const { cart } = this.props;
		if ( ! ( hasDomainRegistration( cart ) || hasTransferProduct( cart ) ) ) {
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
