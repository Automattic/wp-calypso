import { localize } from 'i18n-calypso';
import { Component, Fragment } from 'react';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import {
	getDomainRegistrations,
	getDomainTransfers,
	hasDomainRegistration,
	hasTransferProduct,
} from 'calypso/lib/cart-values/cart-items';
import CheckoutTermsItem from 'calypso/my-sites/checkout/src/components/checkout-terms-item';
import type { DomainLegalAgreementUrl, ResponseCart } from '@automattic/shopping-cart';
import type { LocalizeProps } from 'i18n-calypso';

export interface DomainRegistrationAgreementProps {
	cart: ResponseCart;
}

interface AgreementForDisplay {
	name: string;
	url: string;
	domains: string[];
}

class DomainRegistrationAgreement extends Component<
	DomainRegistrationAgreementProps & LocalizeProps
> {
	recordRegistrationAgreementClick = () => {
		gaRecordEvent( 'Upgrades', 'Clicked Registration Agreement Link' );
	};

	renderAgreementLinkForList = ( agreement: AgreementForDisplay ) => {
		return this.props.translate(
			'View the {{domainRegistrationAgreementLink}}%(legalAgreementName)s{{/domainRegistrationAgreementLink}} for %(domainsList)s.',
			{
				args: {
					domainsList: agreement.domains.join( ', ' ).replace( /, ([^,]*)$/, ' and $1' ),
					legalAgreementName: agreement.name,
				},
				components: {
					domainRegistrationAgreementLink: (
						<a
							href={ agreement.url }
							target="_blank"
							rel="noopener noreferrer"
							onClick={ this.recordRegistrationAgreementClick }
						/>
					),
				},
			}
		);
	};

	renderMultipleAgreements = ( agreementsList: AgreementForDisplay[] ) => {
		const preamble = this.props.translate(
			'You agree to the following domain name registration legal agreements:'
		);
		return (
			<Fragment>
				<p>{ preamble }</p>
				{ agreementsList.map( ( agreement ) => (
					<p key={ agreement.url + agreement.domains.length }>
						{ this.renderAgreementLinkForList( agreement ) }
					</p>
				) ) }
			</Fragment>
		);
	};

	renderSingleAgreement = ( agreement: AgreementForDisplay ) => {
		return (
			<p>
				{ this.props.translate(
					'You agree to the {{domainRegistrationAgreementLink}}Domain Registration Agreement{{/domainRegistrationAgreementLink}} for %(domainsList)s.',
					{
						args: {
							domainsList: agreement.domains.join( ', ' ).replace( /, ([^,]*)$/, ' and $1' ),
						},
						components: {
							domainRegistrationAgreementLink: (
								<a
									href={ agreement.url }
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

		const agreement = agreementsList.shift();

		if ( agreement ) {
			return this.renderSingleAgreement( agreement );
		}
	};

	getDomainsByRegistrationAgreement(): AgreementForDisplay[] {
		const { cart, translate } = this.props;
		const domainItems = getDomainRegistrations( cart );
		domainItems.push( ...getDomainTransfers( cart ) );

		return Object.values(
			domainItems.reduce(
				( agreements: Record< DomainLegalAgreementUrl, AgreementForDisplay >, domainItem ) => {
					if (
						domainItem?.extra?.legal_agreements &&
						// legal_agreements is an array when it's empty due to PHP > JSON encoding.
						! Array.isArray( domainItem.extra.legal_agreements ) &&
						Object.keys( domainItem.extra.legal_agreements ).length > 0
					) {
						const domainAgreements = domainItem.extra.legal_agreements;
						Object.keys( domainAgreements ).forEach( ( url ) => {
							if ( agreements[ url ] ) {
								agreements[ url ].domains.push( domainItem.meta );
							} else {
								agreements[ url ] = {
									name: domainAgreements[ url ],
									url,
									domains: [ domainItem.meta ],
								};
							}
						} );
						return agreements;
					}

					if ( domainItem.extra.domain_registration_agreement_url ) {
						const url = domainItem?.extra?.domain_registration_agreement_url;
						if ( agreements?.[ url ] ) {
							agreements[ url ].domains.push( domainItem.meta );
						} else {
							agreements[ url ] = {
								name: translate( 'Domain Registration Agreement' ),
								url: url,
								domains: [ domainItem.meta ],
							};
						}
						return agreements;
					}

					// This block should never be hit, but since some tests
					// depend on incorrect behaviour we need to keep it.
					const url = 'undefined';
					if ( agreements?.[ url ] ) {
						agreements[ url ].domains.push( domainItem.meta );
					} else {
						agreements[ url ] = {
							name: translate( 'Domain Registration Agreement' ),
							url: url,
							domains: [ domainItem.meta ],
						};
					}
					return agreements;
				},
				{}
			)
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
