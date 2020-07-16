/**
 * External dependencies
 */
import React, { FC } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import type { CartItemValue } from 'lib/cart-values';

interface Props {
	incompatibleProducts: CartItemValue[];
}

const IncompatibleProductMessage: FC< Props > = ( { incompatibleProducts } ) => {
	const translate = useTranslate();
	let content;

	if ( incompatibleProducts.length === 1 ) {
		content = translate(
			"We're sorry, %(productName)s is not compatible with multisite WordPress installations at this time.",
			{
				args: {
					productName: incompatibleProducts[ 0 ].product_name,
				},
			}
		);
	} else {
		content = translate(
			"We're sorry, %(productName1)s and %(productName2)s are not compatible with multisite WordPress installations at this time.",
			{
				args: {
					productName1: incompatibleProducts[ 0 ].product_name,
					productName2: incompatibleProducts[ 1 ].product_name,
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
