/** @format */

/** @TODO remove */
/* eslint-disable no-console */

/**
 * External dependencies
 */
import { Component, Fragment } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { withInstanceId } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import { SIMPLE_PAYMENTS_PRODUCT_POST_TYPE } from 'lib/simple-payments/constants';

/**
 * @FIXME: toFixed should be replaced with proper decimal calculations. See simple-payments/form
 * const { precision } = getCurrencyDefaults( values.currency );
 */

class Edit extends Component {
	componentDidUpdate( prevProps ) {
		// Save on deselect
		// @TODO: Add save on post save?
		// @FIXME: Do not allow multiple saves to be in flight
		if ( prevProps.isSelected && ! this.props.isSelected ) {
			this.savePayment();
		}
	}

	savePayment = async () => {
		const { attributes, setAttributes } = this.props;
		const { paymentId } = attributes;

		// @TODO field validation
		const path = `/wp/v2/${ SIMPLE_PAYMENTS_PRODUCT_POST_TYPE }/${ paymentId ? paymentId : '' }`;
		console.log( path );

		try {
			const { id } = await apiFetch( {
				path,
				method: 'POST',
				body: JSON.stringify( attributesToPost( attributes ) ),
			} );
			setAttributes( { paymentId: id } );
		} catch ( err ) {
			console.error( err );
		}
	};

	handleEmailChange = event => {
		this.props.setAttributes( { email: event.target.value } );
	};

	handleDescriptionChange = event => {
		this.props.setAttributes( { description: event.target.value } );
	};

	handlePriceChange = event => {
		const price = parseFloat( event.target.value );
		if ( ! isNaN( price ) ) {
			this.props.setAttributes( { price } );
		} else {
			this.props.setAttributes( { price: undefined } );
		}
	};

	handleTitleChange = event => {
		this.props.setAttributes( { title: event.target.value } );
	};

	render() {
		const { attributes, instanceId } = this.props;
		const { title, /*currency,*/ description, price, /*multiple,*/ email } = attributes;
		const baseId = `simplepayments-${ instanceId }`;
		const titleId = `${ baseId }__title`;
		const descriptionId = `${ baseId }__description`;
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
					<label htmlFor={ descriptionId }>Description</label>
					<textarea
						id={ descriptionId }
						onChange={ this.handleDescriptionChange }
						value={ description }
					/>
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
						value={ price ? price.toFixed( 2 ) : '' }
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

function attributesToPost( attributes ) {
	const { title, description, price, email } = attributes;

	return {
		title,
		status: 'publish',
		content: description,
		featured_media: '',
		// @FIXME: meta isn't saving. Tried { spay_price: … } simple object literal and it didn't work either :(
		meta: [
			{
				key: 'spay_price',
				value: price,
			},
			{
				key: 'spay_currency',
				value: 'USD',
			},
			{
				key: 'spay_multiple',
				value: 0,
			},
			{
				key: 'spay_email',
				value: email,
			},
			{
				key: 'spay_formatted_price',
				value: '$' + price.toFixed( 2 ),
			},
		],
	};
}
