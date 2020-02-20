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
			<p>
				Product still refundable:
				<br />
				<em>
					<ProductExpiration
						purchaseDateMoment={ moment() }
						expiryDateMoment={ moment() }
						isRefundable
					/>
				</em>
			</p>
			<p>
				Product previously expired:
				<br />
				<em>
					<ProductExpiration expiryDateMoment={ moment( new Date( 0 ) ) } />
				</em>
			</p>
			<p>
				Product subscription expires in future:
				<br />
				<em>
					<ProductExpiration expiryDateMoment={ moment().add( 1, 'day' ) } />
				</em>
			</p>
		</>
	);
}
ProductExpirationExample.displayName = 'ProductExpiration';

export default ProductExpirationExample;
