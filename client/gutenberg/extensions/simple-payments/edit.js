/** @format */

/**
 * External dependencies
 */
import get from 'lodash/get';
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
				<br />
				content: <input type="text" disabled value={ this.props.content || '' } />
				<br />
				featuredMedia: <input type="number" disabled value={ this.props.featuredMedia || '' } />
				<br />
				title: <input type="text" disabled value={ this.props.title || '' } />
				<details>
					<summary>Simple payments object</summary>
					<pre>{ JSON.stringify( this.props.simplePayment, undefined, 2 ) }</pre>
				</details>
			</Fragment>
		);
	}
}

export default withSelect( ( select, { attributes } ) => {
	if ( attributes.paymentId ) {
		const { getEntityRecord } = select( 'core' );
		const simplePayment = getEntityRecord(
			'postType',
			SIMPLE_PAYMENTS_PRODUCT_POST_TYPE,
			attributes.paymentId
		);

		return simplePayment
			? {
					content: get( simplePayment, 'content.raw', '' ),
					featuredMedia: parseInt( simplePayment.featured_media, 10 ) || undefined,
					simplePayment,
					title: get( simplePayment, 'title.raw', '' ),
			  }
			: {};
	}
} )( withInstanceId( Edit ) );
