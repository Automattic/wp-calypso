/** @format */

/** @TODO remove */
/* eslint-disable no-console */

/**
 * External dependencies
 */
import get from 'lodash/get';
import { __ } from '@wordpress/i18n';
import { Component, Fragment } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { compose, withInstanceId } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { SIMPLE_PAYMENTS_PRODUCT_POST_TYPE } from 'lib/simple-payments/constants';

class Edit extends Component {
	componentDidUpdate( prevProps ) {
		// Saves on block-deselect
		// @TODO: Add save on post save?
		// @FIXME: Do not allow multiple saves to be in flight
		if ( prevProps.isSelected && ! this.props.isSelected ) {
			this.savePayment();
		}
	}

	componentDidMount() {
		const { attributes, setAttributes } = this.props;
		setAttributes( {
			formattedPrice: this.formatPrice( attributes.price ),
		} );
	}

	attributesToPost = attributes => {
		const { title, description, currency, price, email, multiple } = attributes;

		return {
			title,
			status: 'publish',
			content: description,
			featured_media: 0,
			meta: {
				spay_currency: currency,
				spay_email: email,
				spay_formatted_price: this.formatPrice( price ),
				spay_multiple: multiple,
				spay_price: price,
			},
		};
	};

	savePayment = async () => {
		const { attributes, setAttributes } = this.props;
		const { paymentId } = attributes;

		// @TODO field validation
		const path = `/wp/v2/${ SIMPLE_PAYMENTS_PRODUCT_POST_TYPE }/${ paymentId ? paymentId : '' }`;
		console.log( path );

		try {
			const simplePayment = await apiFetch( {
				path,
				method: 'POST',
				data: this.attributesToPost( attributes ),
			} );

			console.log( '->POST:', simplePayment );

			const { id } = simplePayment;
			if ( id ) {
				setAttributes( { paymentId: id } );
			}
		} catch ( err ) {
			console.error( err );
		}
	};

	// @FIXME: toFixed should be replaced with proper decimal calculations. See simple-payments/form
	// const { precision } = getCurrencyDefaults( values.currency );
	formatPrice = price => {
		price = parseInt( price, 10 );
		return ! isNaN( price ) ? '$' + price.toFixed( 2 ) : '';
	};

	handleEmailChange = event => {
		this.props.setAttributes( { email: event.target.value } );
	};

	handleDescriptionChange = event => {
		this.props.setAttributes( { description: event.target.value } );
	};

	handlePriceChange = event => {
		const price = parseInt( event.target.value, 10 );
		if ( ! isNaN( price ) ) {
			this.props.setAttributes( {
				formattedPrice: this.formatPrice( event.target.value ),
				price,
			} );
		} else {
			this.props.setAttributes( {
				formattedPrice: '',
				price: undefined,
			} );
		}
	};

	handleCurrencyChange = event => {
		this.props.setAttributes( {
			currency: event.target.value,
			formattedPrice: this.formatPrice( this.props.attributes.price ),
		} );
	};

	handleMultipleChange = event => {
		this.props.setAttributes( { multiple: event.target.checked ? 1 : 0 } );
	};

	handleTitleChange = event => {
		this.props.setAttributes( { title: event.target.value } );
	};

	render() {
		const { attributes, instanceId } = this.props;
		const {
			paymentId,
			title,
			currency,
			description,
			price,
			formattedPrice,
			multiple,
			email,
		} = attributes;
		const baseId = `simplepayments-${ instanceId }`;
		const titleId = `${ baseId }__title`;
		const descriptionId = `${ baseId }__description`;
		const currencyId = `${ baseId }__currency`;
		const priceId = `${ baseId }__price`;
		const multipleId = `${ baseId }__multiple`;
		const emailId = `${ baseId }__email`;

		return (
			<Fragment>
				<div>ID: { paymentId || 'N/A' }</div>
				<div>Formatted price: { formattedPrice }</div>
				<div>
					<label htmlFor={ titleId }>{ __( 'Title', 'jetpack' ) }</label>
					<input id={ titleId } onChange={ this.handleTitleChange } type="text" value={ title } />
				</div>
				<div>
					<label htmlFor={ descriptionId }>{ __( 'Description', 'jetpack' ) }</label>
					<textarea
						id={ descriptionId }
						onChange={ this.handleDescriptionChange }
						value={ description }
					/>
				</div>
				<div>
					<label htmlFor={ currencyId }>{ __( 'Currency', 'jetpack' ) }</label>
					<input
						id={ currencyId }
						maxLength="3"
						onChange={ this.handleCurrencyChange }
						type="text"
						value={ currency }
					/>
				</div>
				<div>
					<label htmlFor={ priceId }>{ __( 'Price', 'jetpack' ) }</label>
					<input
						id={ priceId }
						min={ 1 }
						onChange={ this.handlePriceChange }
						step={ 1 }
						type="number"
						value={ price || '' }
					/>
				</div>
				<div>
					<label htmlFor={ multipleId }>
						{ __( 'Allow multiple', 'jetpack' ) }
						<input
							checked={ Boolean( multiple ) }
							id={ multipleId }
							onChange={ this.handleMultipleChange }
							type="checkbox"
						/>
					</label>
				</div>
				<div>
					<label htmlFor={ emailId }>{ __( 'Email', 'jetpack' ) }</label>
					<input id={ emailId } onChange={ this.handleEmailChange } type="email" value={ email } />
				</div>
			</Fragment>
		);
	}
}

const applyWithSelect = withSelect( ( select, { attributes } ) => {
	if ( attributes.paymentId ) {
		const { getEntityRecord } = select( 'core' );

		const simplePayment = getEntityRecord(
			'postType',
			SIMPLE_PAYMENTS_PRODUCT_POST_TYPE,
			attributes.paymentId
		);

		console.log( '->GET:', simplePayment );

		return {
			content: get( simplePayment, 'content.raw', attributes.content ),
			currency: get( simplePayment, 'meta.spay_currency', attributes.currency ),
			email: get( simplePayment, 'meta.spay_email', attributes.email ),
			formattedPrice: get( simplePayment, 'meta.spay_formatted_price', attributes.formattedPrice ),
			multiple: get( simplePayment, 'meta.spay_multiple', attributes.multiple ),
			price: get( simplePayment, 'meta.spay_price', attributes.price ),
			title: get( simplePayment, 'title.raw', attributes.title ),
		};
	}
} );

export default compose( [ applyWithSelect, withInstanceId ] )( Edit );
