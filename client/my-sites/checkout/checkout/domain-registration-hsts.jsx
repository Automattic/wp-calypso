/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { isEmpty, join, merge, reduce } from 'lodash';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import { getDomainRegistrations, getDomainTransfers } from 'lib/cart-values/cart-items';
import { HTTPS_SSL } from 'lib/url/support';
import { getProductsList } from 'state/products-list/selectors';
import { getTld, isHstsRequired } from 'lib/domains';

class DomainRegistrationHsts extends React.PureComponent {
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

		return join( hstsTlds, ', ' );
	};

	render() {
		const tlds = this.getHstsTlds();

		if ( ! tlds ) {
			return null;
		}

		const { translate } = this.props;

		return (
			<div className="checkout__domain-registration-hsts">
				<Gridicon icon="info-outline" size={ 18 } />
				<p>
					{ translate(
						'All domains ending in {{strong}}%(tld)s{{/strong}} require an SSL certificate ' +
							'to host a website. When you host this domain at WordPress.com an SSL ' +
							'certificate is included. {{a}}Learn more{{/a}}.',
						{
							args: {
								tld: tlds,
							},
							components: {
								a: <a href={ HTTPS_SSL } target="_blank" rel="noopener noreferrer" />,
								strong: <strong />,
							},
						}
					) }
				</p>
			</div>
		);
	}
}

export default connect( ( state ) => ( {
	productsList: getProductsList( state ),
} ) )( localize( DomainRegistrationHsts ) );
