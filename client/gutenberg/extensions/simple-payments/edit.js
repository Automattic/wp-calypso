/** @format */

/**
 * External dependencies
 */
import get from 'lodash/get';
import { Component, Fragment } from '@wordpress/element';
import { compose, withInstanceId } from '@wordpress/compose';
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
				<br />
				content: <input type="text" disabled value={ this.props.content || '' } />
				<br />
				title: <input type="text" disabled value={ this.props.title || '' } />
				<br />
				price: <input type="text" disabled value={ this.props.price || '' } />
				<br />
				currency: <input type="text" disabled value={ this.props.currency || '' } />
				<br />
				cta: <input type="text" disabled value={ this.props.cta || '' } />
				<br />
				multiple: <input type="text" disabled value={ this.props.multiple || '' } />
				<br />
				email: <input type="text" disabled value={ this.props.email || '' } />
				<br />
				formatted_price: <input type="text" disabled value={ this.props.formatted_price || '' } />
				<details>
					<summary>Simple payments object</summary>
					<pre>{ JSON.stringify( this.props.simplePayment, undefined, 2 ) }</pre>
				</details>
			</Fragment>
		);
	}
}

export default compose( [
	withSelect( ( select, { attributes } ) => {
		if ( attributes.paymentId ) {
			const { getEntityRecord } = select( 'core' );
			const simplePayment = getEntityRecord(
				'postType',
				SIMPLE_PAYMENTS_PRODUCT_POST_TYPE,
				attributes.paymentId
			);

			return {
				simplePayment: simplePayment || {},
				content: get( simplePayment, 'content.raw', '' ),
				title: get( simplePayment, 'title.raw', '' ),
				price: get( simplePayment, 'meta.spay_price', undefined ),
				currency: get( simplePayment, 'meta.spay_currency', '' ),
				cta: get( simplePayment, 'meta.spay_cta', '' ),
				multiple: get( simplePayment, 'meta.spay_multiple', 0 ),
				email: get( simplePayment, 'meta.spay_email', '' ),
				formatted_price: get( simplePayment, 'meta.spay_formatted_price', '' ),
			};
		}
	} ),
	withInstanceId,
] )( Edit );
