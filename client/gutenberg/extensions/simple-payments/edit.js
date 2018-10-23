/** @format */

/**
 * External dependencies
 */
import { Component, Fragment } from '@wordpress/element';
import { withInstanceId } from '@wordpress/compose';

class Edit extends Component {
	handleChange = event => {
		this.props.setAttributes( { paymentId: event.target.value } );
	};

	render() {
		const { attributes, instanceId } = this.props;
		const inputId = `payment-id-${ instanceId }`;
		return (
			<Fragment>
				<label htmlFor={ inputId }>Simple Payment ID</label>
				<input type="number" id={ inputId } value={ attributes.paymentId } />
			</Fragment>
		);
	}
}

export default withInstanceId( Edit );
