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

/* eslint-disable wpcalypso/jsx-classname-namespace */

class DomainRegistrationAgreement extends Component {
	recordRegistrationAgreementClick = () => {
		gaRecordEvent( 'Upgrades', 'Clicked Registration Agreement Link' );
	};

	renderAgreementLinkForList = ( url, name, domains ) => {
		return this.props.translate(
			'View the {{domainRegistrationAgreementLink}}%(legalAgreementName)s{{/domainRegistrationAgreementLink}} for %(domainsList)s.',
			{
				args: {
					domainsList: domains.join( ', ' ).replace( /, ([^,]*)$/, ' and $1' ),
					legalAgreementName: name,
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
			'You agree to the following domain name registration legal agreements:'
		);
		return (
			<Fragment>
				<p>{ preamble }</p>
				{ agreementsList.map( ( { url, name, domains } ) => (
					<p key={ url + domains.length }>
						{ this.renderAgreementLinkForList( url, name, domains ) }
					</p>
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
		const { cart, translate } = this.props;
		const domainItems = getDomainRegistrations( cart );
		domainItems.push( ...getDomainTransfers( cart ) );

		return Object.values(
			domainItems.reduce( ( agreements, domainItem ) => {
				if (
					domainItem?.extra?.legal_agreements &&
					Object.keys( domainItem.extra.legal_agreements ).length > 0
				) {
					Object.keys( domainItem.extra.legal_agreements ).forEach( ( url ) => {
						if ( agreements[ url ] ) {
							agreements[ url ].domains.push( domainItem.meta );
						} else {
							agreements[ url ] = {
								name: domainItem.extra.legal_agreements[ url ],
								url,
								domains: [ domainItem.meta ],
							};
						}
					} );
				} else if ( domainItem?.extra?.domain_registration_agreement_url ) {
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
				} else {
					// This else should never be hit, but since some tests depend on incorrect behaviour we need to keep it
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
				}
				return agreements;
			}, {} )
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
