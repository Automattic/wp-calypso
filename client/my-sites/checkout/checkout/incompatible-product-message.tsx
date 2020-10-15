/**
 * External dependencies
 */
import React, { FC } from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal dependencies
 */
import type { IncompatibleProducts } from 'calypso/state/sites/products/conflicts';

interface Props {
	incompatibleProducts: IncompatibleProducts | null;
}

const IncompatibleProductMessage: FC< Props > = ( { incompatibleProducts } ) => {
	if ( ! incompatibleProducts ) {
		return null;
	}

	const { products } = incompatibleProducts;
	let content;
	if ( products.length === 1 ) {
		content = translate(
			"We're sorry, %(productName)s is not compatible with multisite WordPress installations at this time.",
			{
				args: {
					productName: products[ 0 ].product_name,
				},
			}
		);
	} else {
		content = translate(
			"We're sorry, %(productName1)s and %(productName2)s are not compatible with multisite WordPress installations at this time.",
			{
				args: {
					productName1: products[ 0 ].product_name,
					productName2: products[ 1 ].product_name,
				},
			}
		);
	}
	return (
		<>
			{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
			<div className="payment-box-multisite">
				<Gridicon icon={ 'notice' } size={ 18 } />
				<p>{ content }</p>
			</div>
		</>
	);
};

export default IncompatibleProductMessage;
