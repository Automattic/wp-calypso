/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import PlansNavigation from 'my-sites/plans/navigation';
import CartData from 'components/data/cart';

const PlansHeader = () => {
	return (
		<CartData>
			<PlansNavigation path={ '/plans' } />
		</CartData>
	);
};

export default function setJetpackHeader( context: PageJS.Context ) {
	context.header = <PlansHeader />;
}
