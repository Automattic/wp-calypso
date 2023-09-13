import { localize } from 'i18n-calypso';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { getDomainRegistrations, getDomainTransfers } from 'calypso/lib/cart-values/cart-items';
import { getTld, isDotGayNoticeRequired } from 'calypso/lib/domains';
import CheckoutTermsItem from 'calypso/my-sites/checkout/src/components/checkout-terms-item';
import { getProductsList } from 'calypso/state/products-list/selectors';

/* eslint-disable wpcalypso/jsx-classname-namespace */

class DomainRegistrationDotGay extends PureComponent {
	getDotGayTlds = () => {
		const { cart, productsList } = this.props;
		const domains = [ ...getDomainRegistrations( cart ), ...getDomainTransfers( cart ) ];

		if ( ! domains.length ) {
			return null;
		}

		const dotGayTlds = domains.reduce( ( tlds, domain ) => {
			if ( isDotGayNoticeRequired( domain.product_slug, productsList ) ) {
				const tld = '.' + getTld( domain.meta );

				if ( tlds.indexOf( tld ) === -1 ) {
					tlds.push( tld );
				}
			}

			return tlds;
		}, [] );

		return dotGayTlds.join( ', ' );
	};

	render() {
		const tlds = this.getDotGayTlds();

		if ( ! tlds ) {
			return null;
		}

		const { translate } = this.props;

		return (
			<CheckoutTermsItem>
				{ translate(
					'The use of .gay domains to host any anti-LGBTQ content is prohibited and can result in registration termination. The registry will donate 20% of all registration revenue to LGBTQ non-profit organizations.'
				) }
			</CheckoutTermsItem>
		);
	}
}

export default connect( ( state ) => ( {
	productsList: getProductsList( state ),
} ) )( localize( DomainRegistrationDotGay ) );
