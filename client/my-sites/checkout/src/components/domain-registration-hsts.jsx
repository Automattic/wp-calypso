import { localizeUrl } from '@automattic/i18n-utils';
import { localize } from 'i18n-calypso';
import { isEmpty, merge, reduce } from 'lodash';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { getDomainRegistrations, getDomainTransfers } from 'calypso/lib/cart-values/cart-items';
import { getTld, isHstsRequired } from 'calypso/lib/domains';
import { HTTPS_SSL } from 'calypso/lib/url/support';
import CheckoutTermsItem from 'calypso/my-sites/checkout/src/components/checkout-terms-item';
import { getProductsList } from 'calypso/state/products-list/selectors';

/* eslint-disable wpcalypso/jsx-classname-namespace */

class DomainRegistrationHsts extends PureComponent {
	getHstsTlds = () => {
		const { cart, productsList } = this.props;
		const domains = merge( getDomainRegistrations( cart ), getDomainTransfers( cart ) );

		if ( isEmpty( domains ) ) {
			return null;
		}

		const hstsTlds = reduce(
			domains,
			( tlds, domain ) => {
				if ( isHstsRequired( domain.product_slug, productsList ) ) {
					const tld = '.' + getTld( domain.meta );

					if ( tlds.indexOf( tld ) === -1 ) {
						tlds.push( tld );
					}
				}

				return tlds;
			},
			[]
		);

		return hstsTlds.join( ', ' );
	};

	render() {
		const tlds = this.getHstsTlds();

		if ( ! tlds ) {
			return null;
		}

		const { translate } = this.props;

		return (
			<CheckoutTermsItem>
				{ translate(
					'All domains ending in {{strong}}%(tld)s{{/strong}} require an SSL certificate ' +
						'to host a website. When you host this domain at WordPress.com an SSL ' +
						'certificate is included. {{a}}Learn more{{/a}}.',
					{
						args: {
							tld: tlds,
						},
						components: {
							a: <a href={ localizeUrl( HTTPS_SSL ) } target="_blank" rel="noopener noreferrer" />,
							strong: <strong />,
						},
					}
				) }
			</CheckoutTermsItem>
		);
	}
}

export default connect( ( state ) => ( {
	productsList: getProductsList( state ),
} ) )( localize( DomainRegistrationHsts ) );
