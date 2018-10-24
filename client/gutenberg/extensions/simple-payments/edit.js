/** @format */

/**
 * External dependencies
 */
import { Component, Fragment } from '@wordpress/element';
import { withInstanceId } from '@wordpress/compose';

class Edit extends Component {
	handleEmailChange = event => {
		this.props.setAttributes( { email: event.target.value } );
	};

	handlePriceChange = event => {
		const price = parseFloat( event.target.value );
		if ( ! isNaN( price ) ) {
			this.props.setAttributes( { price: price.toFixed( 2 ) } );
		} else {
			this.props.setAttributes( { price: undefined } );
		}
	};

	handleTitleChange = event => {
		this.props.setAttributes( { title: event.target.value } );
	};

	render() {
		const { attributes, instanceId } = this.props;
		const { title, /*currency,*/ price, /*multiple,*/ email } = attributes;
		const baseId = `simplepayments-${ instanceId }`;
		const titleId = `${ baseId }__title`;
		const currencyId = `${ baseId }__currency`;
		const priceId = `${ baseId }__price`;
		const multipleId = `${ baseId }__multiple`;
		const emailId = `${ baseId }__email`;

		return (
			<Fragment>
				<div>
					<label htmlFor={ titleId }>Title</label>
					<input id={ titleId } onChange={ this.handleTitleChange } type="text" value={ title } />
				</div>
				<div>
					<label htmlFor={ currencyId }>Currency</label>
					<input id={ currencyId } type="text" value="USD" />
				</div>
				<div>
					<label htmlFor={ priceId }>Price</label>
					<input
						id={ priceId }
						min={ 0.01 }
						onChange={ this.handlePriceChange }
						step={ 0.01 }
						type="number"
						value={ price }
					/>
				</div>
				<div>
					<label htmlFor={ multipleId }>
						Allow multiple
						<input disabled id={ multipleId } type="checkbox" />
					</label>
				</div>
				<div>
					<label htmlFor={ emailId }>Email</label>
					<input id={ emailId } onChange={ this.handleEmailChange } type="email" value={ email } />
				</div>
			</Fragment>
		);
	}
}

export default withInstanceId( Edit );
