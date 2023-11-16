import { localize } from 'i18n-calypso';
import { get, map, reduce } from 'lodash';
import { Component, Fragment } from 'react';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import {
	getDomainRegistrations,
	getDomainTransfers,
	hasDomainRegistration,
	hasTransferProduct,
} from 'calypso/lib/cart-values/cart-items';
import CheckoutTermsItem from 'calypso/my-sites/checkout/src/components/checkout-terms-item';

/* eslint-disable wpcalypso/jsx-classname-namespace */

class DomainRegistrationAgreement extends Component {
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
		return (
			<Fragment>
				<p>{ preamble }</p>
				{ map( agreementsList, ( { url, domains } ) => (
					<p key={ url + domains.length }>{ this.renderAgreementLinkForList( url, domains ) }</p>
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

		return <CheckoutTermsItem isPrewrappedChildren>{ this.renderAgreements() }</CheckoutTermsItem>;
	}
}

export default localize( DomainRegistrationAgreement );
