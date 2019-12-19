/**
 * External dependencies
 */

import React from 'react';
import moment from 'moment';

/**
 * Internal dependencies
 */
import ProductExpiration from '../index';

function ProductExpirationExample() {
	return (
		<>
			<h3>Product still refundable</h3>
			<p>
				<ProductExpiration
					purchaseDateMoment={ moment() }
					expiryDateMoment={ moment() }
					isRefundable
				/>
			</p>
			<h3>Product previously expired</h3>
			<p>
				<ProductExpiration expiryDateMoment={ moment( new Date( 0 ) ) } />
			</p>
			<h3>Product subscription expires in future</h3>
			<p>
				<ProductExpiration expiryDateMoment={ moment().add( 1, 'day' ) } />
			</p>
		</>
	);
}
ProductExpirationExample.displayName = 'ProductExpiration';

export default ProductExpirationExample;
