/** @format */

/**
 * External dependencies
 */
import { Component, Fragment } from '@wordpress/element';
import { withInstanceId } from '@wordpress/compose';

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
			</Fragment>
		);
	}
}

export default withInstanceId( Edit );
