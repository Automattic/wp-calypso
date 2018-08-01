/** @format */

/**
 * External dependencies
 */

import React from 'react';
import concat from 'lodash/fp/concat';
import filter from 'lodash/fp/filter';
import flow from 'lodash/fp/flow';
import map from 'lodash/fp/map';
import sortBy from 'lodash/fp/sortBy';

/**
 * Internal dependencies
 */
import PaymentLogo, { POSSIBLE_TYPES } from '../index';

const genVendors = flow(
	// 'placeholder' is a special case that needs to be demonstrated separately
	filter( type => type !== 'placeholder' ),

	map( type => ( { type, isCompact: false } ) ),
	concat( [ { type: 'paypal', isCompact: true } ] ),
	sortBy( [ 'type', 'isCompact' ] )
);

const VENDORS = genVendors( POSSIBLE_TYPES );

class PaymentLogoExamples extends React.PureComponent {
	static displayName = 'PaymentLogo';

	render() {
		return (
			<div className="payment-logo-example">
				<p>Empty Placeholder</p>

				<PaymentLogo type="placeholder" />

				<p>Supported Vendors</p>

				{ VENDORS.map( ( { type, isCompact } ) => (
					<div key={ [ type, isCompact ].join( '_' ) }>
						<PaymentLogo type={ type } isCompact={ isCompact } />
					</div>
				) ) }
			</div>
		);
	}
}

export default PaymentLogoExamples;
