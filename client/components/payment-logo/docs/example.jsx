import { flow, sortBy } from '@automattic/js-utils';
import { filter, map } from 'lodash';
import { PureComponent } from 'react';
import PaymentLogo, { POSSIBLE_TYPES } from '../index';

const genVendors = flow(
	// 'placeholder' is a special case that needs to be demonstrated separately
	( arr ) => filter( arr, ( type ) => type !== 'placeholder' ),

	( arr ) => map( arr, ( type ) => ( { type, isCompact: false } ) ),
	( arr ) => arr.concat( [ { type: 'paypal', isCompact: true } ] ),
	( arr ) => sortBy( arr, [ 'type', 'isCompact' ] )
);

const VENDORS = genVendors( POSSIBLE_TYPES );

class PaymentLogoExamples extends PureComponent {
	static displayName = 'PaymentLogo';

	render() {
		/* eslint-disable wpcalypso/jsx-classname-namespace */
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
