import { DOMAIN_PROMOTIONAL_PRICING_POLICY } from '@automattic/urls';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import {
	getDomainMappings,
	getDomainRegistrations,
	getDomainTransfers,
	hasDomainRegistration,
	hasTransferProduct,
} from 'calypso/lib/cart-values/cart-items';
import CheckoutTermsItem from 'calypso/my-sites/checkout/src/components/checkout-terms-item';
import type { ResponseCart } from '@automattic/shopping-cart';
import type { LocalizeProps } from 'i18n-calypso';

export interface DomainPromotionalPricingRestrictionsProps {
	cart: ResponseCart;
}

class DomainPromotionalPricingRestrictions extends Component<
	DomainPromotionalPricingRestrictionsProps & LocalizeProps
> {
	recordPromotionalPricingPolicyClick = () => {
		gaRecordEvent( 'Upgrades', 'Clicked Registration Agreement Link' );
	};

	hasAnyDomainWithPromotionalPrice( cart: ResponseCart ): boolean {
		const domainProducts = [
			...getDomainRegistrations( cart ),
			...getDomainMappings( cart ),
			...getDomainTransfers( cart ),
		];
		return domainProducts.some(
			( product ) => product.item_subtotal_integer !== product.item_original_subtotal_integer
		);
	}

	renderPromotionalPricingRestrictionsLink = () => {
		return (
			<p>
				{ this.props.translate(
					'{{promotionalPricingPolicyLink}}Restrictions apply{{/promotionalPricingPolicyLink}}.',
					{
						components: {
							promotionalPricingPolicyLink: (
								<a
									href={ DOMAIN_PROMOTIONAL_PRICING_POLICY }
									target="_blank"
									rel="noopener noreferrer"
									onClick={ this.recordPromotionalPricingPolicyClick }
								/>
							),
						},
					}
				) }
			</p>
		);
	};

	render() {
		const { cart } = this.props;
		if (
			! ( hasDomainRegistration( cart ) || hasTransferProduct( cart ) ) &&
			! this.hasAnyDomainWithPromotionalPrice( cart )
		) {
			return null;
		}

		return (
			<CheckoutTermsItem isPrewrappedChildren>
				{ this.renderPromotionalPricingRestrictionsLink() }
			</CheckoutTermsItem>
		);
	}
}

export default localize( DomainPromotionalPricingRestrictions );
