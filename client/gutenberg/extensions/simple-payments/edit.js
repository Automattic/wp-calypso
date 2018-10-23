/** @format */

/**
 * External dependencies
 */
import { Component, Fragment } from '@wordpress/element';
import { withInstanceId } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { SIMPLE_PAYMENTS_PRODUCT_POST_TYPE } from 'lib/simple-payments/constants';

class Edit extends Component {
	handleChange = event => {
		const paymentId = parseInt( event.target.value, 10 );
		if ( paymentId ) {
			this.props.setAttributes( { paymentId } );
		} else {
			this.props.setAttributes( { paymentId: undefined } );
		}
	};

	render() {
		const { attributes, instanceId } = this.props;
		const inputId = `payment-id-${ instanceId }`;
		return (
			<Fragment>
				<label htmlFor={ inputId }>Simple Payment ID</label>
				<input
					id={ inputId }
					onChange={ this.handleChange }
					type="number"
					value={ attributes.paymentId || '' }
				/>
				<pre>
					{ JSON.stringify( this.props.simplePayments, undefined, 2 ) }
				</pre>
			</Fragment>
		);
	}
}

export default withSelect( select => {
	const { getEntityRecords } = select( 'core' );
	return {
		simplePayments: getEntityRecords( 'postType', SIMPLE_PAYMENTS_PRODUCT_POST_TYPE, {
			status: 'publish',
		} ),
	};
} )( withInstanceId( Edit ) );
