/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PlansNavigation from 'my-sites/plans/navigation';
import CartData from 'components/data/cart';
import FormattedHeader from 'components/formatted-header';

const PlansHeader = () => (
	<>
		<FormattedHeader headerText={ translate( 'Plans' ) } align="left" brandFont />
		<CartData>
			<PlansNavigation path={ '/plans' } />
		</CartData>
	</>
);

export default function setJetpackHeader( context: PageJS.Context ) {
	context.header = <PlansHeader />;
}
