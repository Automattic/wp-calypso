/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';

export function UpSellCoupon( { onClick } ) {
	return (
		<div>
			<h4>Exclusive offer</h4>
			<p>Buy a quick start session and get 50% off.</p>
			<Button onClick={ onClick }>Add to cart</Button>
		</div>
	);
}
