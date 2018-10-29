/** @format */

/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { Component, Fragment } from '@wordpress/element';
import { SelectControl, TextareaControl, TextControl, ToggleControl } from '@wordpress/components';
import { withSelect } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';
import classNames from 'classnames';
import emailValidator from 'email-validator';
import get from 'lodash/get';
import padEnd from 'lodash/padEnd';
import trimEnd from 'lodash/trimEnd';

/**
 * Internal dependencies
 */
import { getCurrencyDefaults } from 'lib/format-currency';
import {
	SIMPLE_PAYMENTS_PRODUCT_POST_TYPE,
	SUPPORTED_CURRENCY_LIST,
} from 'lib/simple-payments/constants';
import ProductPlaceholder from './product-placeholder';

class Edit extends Component {
	constructor() {
		super( ...arguments );
		this.state = {
			savingProduct: false,
			fieldTitleError: '',
			fieldPriceError: '',
			fieldEmailError: '',
			fieldTitleVisited: false,
			fieldPriceVisited: false,
			fieldEmailVisited: false,
		};
	}

	componentDidUpdate( prevProps ) {
		const { simplePayment, attributes, setAttributes, isSelected, isSaving } = this.props;

		// @TODO check componentDidMount for the case where post was already loaded
		if ( ! prevProps.simplePayment && simplePayment ) {
			setAttributes( {
				content: get( simplePayment, 'content.raw', attributes.content ),
				currency: get( simplePayment, 'meta.spay_currency', attributes.currency ),
				email: get( simplePayment, 'meta.spay_email', attributes.email ),
				formattedPrice: get(
					simplePayment,
					'meta.spay_formatted_price',
					attributes.formattedPrice
				),
				multiple: get( simplePayment, 'meta.spay_multiple', attributes.multiple ),
				price: get( simplePayment, 'meta.spay_price', attributes.price ),
				title: get( simplePayment, 'title.raw', attributes.title ),
			} );
		}

		// Saves on block-deselect and when editor is saving a post
		if ( ( prevProps.isSelected && ! isSelected ) || ( prevProps.isSaving && ! isSaving ) ) {
			this.savePayment();
		}
	}

	attributesToPost = attributes => {
		const { title, content, currency, price, email, multiple } = attributes;

		return {
			title,
			status: 'publish',
			content,
			featured_media: 0,
			meta: {
				spay_currency: currency,
				spay_email: email,
				spay_formatted_price: this.formatPrice( price ),
				spay_multiple: parseInt( multiple, 10 ),
				spay_price: price,
			},
		};
	};

	validateEmail = email => {
		if ( ! email ) {
			return __(
				'We want to make sure payments reach you, so please add an email address.',
				'jetpack'
			);
		}

		if ( ! emailValidator.validate( email ) ) {
			return sprintf( __( '%s is not a valid email address.', 'jetpack' ), 'email' );
		}

		return false;
	};

	savePayment = async () => {
		const { attributes, setAttributes } = this.props;
		const { currency, email, paymentId, price, title } = attributes;
		const { fieldTitleError, fieldPriceError, fieldEmailError, savingProduct } = this.state;

		// Do not save while already saving
		// Do not save if missing required fields
		// Do not save if fields have invalid data
		if (
			savingProduct ||
			! currency ||
			! email ||
			! price ||
			! title ||
			fieldEmailError ||
			fieldPriceError ||
			fieldTitleError
		) {
			return;
		}

		this.setState( { savingProduct: true } );

		const path = `/wp/v2/${ SIMPLE_PAYMENTS_PRODUCT_POST_TYPE }/${ paymentId ? paymentId : '' }`;

		try {
			// @TODO: then/catch
			const { id } = await apiFetch( {
				path,
				method: 'POST',
				data: this.attributesToPost( attributes ),
			} );

			this.setState( { savingProduct: false } );

			if ( id ) {
				setAttributes( { paymentId: id } );
			}
		} catch ( err ) {
			// @TODO: error handling
			this.setState( { savingProduct: false } );
		}
	};

	// @FIXME: toFixed should be replaced with proper decimal calculations. See simple-payments/form
	// const { precision } = getCurrencyDefaults( values.currency );
	formatPrice = price => {
		price = parseInt( price, 10 );
		return ! isNaN( price ) ? '$' + price.toFixed( 2 ) : '';
	};

	handleEmailChange = email => {
		this.props.setAttributes( {
			email,
			fieldEmailVisited: true,
			fieldEmailError: this.validateEmail( email ),
		} );
	};

	handleContentChange = content => {
		this.props.setAttributes( { content } );
	};

	handlePriceChange = price => {
		price = parseFloat( price );
		if ( ! isNaN( price ) ) {
			this.props.setAttributes( {
				fieldEmailVisited: true,
				formattedPrice: this.formatPrice( price ),
				price,
			} );
		} else {
			this.props.setAttributes( {
				fieldEmailVisited: true,
				formattedPrice: '',
				price: undefined,
			} );
		}
	};

	handleCurrencyChange = currency => {
		this.props.setAttributes( {
			currency,
			formattedPrice: this.formatPrice( this.props.attributes.price ),
		} );
	};

	handleMultipleChange = multiple => {
		this.props.setAttributes( { multiple: !! multiple } );
	};

	handleTitleChange = title => {
		this.setState( {
			title,
			fieldTitleVisited: true,
		} );
		this.props.setAttributes( { title } );
	};

	pricePlaceholder = ( price, currency ) => {
		const { precision } = getCurrencyDefaults( currency );
		// Tune the placeholder to the precision value: 0 -> '1', 1 -> '1.0', 2 -> '1.00'
		return precision > 0 ? padEnd( '1.', precision + 2, '0' ) : '1';
	};

	getCurrencyList = SUPPORTED_CURRENCY_LIST.map( value => {
		const { symbol } = getCurrencyDefaults( value );
		// if symbol is equal to the code (e.g., 'CHF' === 'CHF'), don't duplicate it.
		// trim the dot at the end, e.g., 'kr.' becomes 'kr'
		const label = symbol === value ? value : `${ value } ${ trimEnd( symbol, '.' ) }`;
		return { value, label };
	} );

	render() {
		const {
			fieldEmailError,
			fieldPriceError,
			fieldPriceVisited,
			fieldTitleError,
			fieldTitleVisited,
		} = this.state;
		const { attributes, isSelected } = this.props;
		const { content, currency, email, formattedPrice, multiple, price, title } = attributes;

		if (
			! isSelected &&
			email &&
			price &&
			title &&
			! fieldEmailError &&
			! fieldPriceError &&
			! fieldTitleError
		) {
			return (
				<ProductPlaceholder content={ content } formattedPrice={ formattedPrice } title={ title } />
			);
		}

		// @TODO: fix link
		// sprintf( '<a href="%s" target="_blank" rel="noopener noreferrer">PayPal</a>', 'https://www.paypal.com/' );
		const emailHelp = __(
			"This is where PayPal will send your money. To claim a payment, you'll " +
				'need a  need a PayPal account connected to a bank account.',
			'jetpack'
		);

		// @TODO: Form should be disabled while fetching data
		return (
			<div className="wp-block-jetpack-simple-payments">
				<Fragment>
					<TextControl
						className={ classNames( 'simple-payments__field', 'simple-payments__field-title', {
							'simple-payments__field-has-error': fieldTitleVisited && fieldTitleError,
						} ) }
						help={
							fieldTitleVisited && fieldTitleError
								? __(
										"People need to know what they're paying for! Please add a brief title.",
										'jetpack'
								  )
								: null
						}
						label={ __( 'Item name', 'jetpack' ) }
						onChange={ this.handleTitleChange }
						placeholder={ __( 'Item name', 'jetpack' ) }
						type="text"
						value={ title }
					/>

					<TextareaControl
						className="simple-payments__field simple-payments__field-content"
						label={ __( 'Enter a description for your item', 'jetpack' ) }
						onChange={ this.handleContentChange }
						placeholder={ __( 'Enter a description for your item', 'jetpack' ) }
						value={ content }
					/>

					<div className="simple-payments__price-container">
						<SelectControl
							className="simple-payments__field simple-payments__field-currency"
							label={ __( 'Currency', 'jetpack' ) }
							onChange={ this.handleCurrencyChange }
							options={ this.getCurrencyList }
							value={ currency }
						/>
						<TextControl
							className={ classNames( 'simple-payments__field', 'simple-payments__field-price', {
								'simple-payments__field-has-error': fieldPriceError,
							} ) }
							help={
								fieldPriceVisited && fieldPriceError
									? __( 'Everything comes with a price tag these days. Add yours here.', 'jetpack' )
									: null
							}
							label={ __( 'Price', 'jetpack' ) }
							min={ 0 }
							onChange={ this.handlePriceChange }
							placeholder={ this.pricePlaceholder( price || 0, currency ) }
							step="1"
							type="number"
							value={ price || '' }
						/>
					</div>

					<div className="simple-payments__field-multiple">
						<ToggleControl
							checked={ Boolean( multiple ) }
							label={ __( 'Allow people buy more than one item at a time', 'jetpack' ) }
							onChange={ this.handleMultipleChange }
						/>
					</div>

					<TextControl
						className={ classNames( 'simple-payments__field', 'simple-payments__field-email', {
							'simple-payments__field-has-error': fieldEmailError,
						} ) }
						help={ fieldEmailError ? fieldEmailError : emailHelp }
						label={ __( 'Email', 'jetpack' ) }
						onChange={ this.handleEmailChange }
						placeholder={ __( 'Email', 'jetpack' ) }
						type="email"
						value={ email }
					/>
					{ fieldEmailError ? (
						<p className="components-base-control__help">{ emailHelp }</p>
					) : null }
				</Fragment>
			</div>
		);
	}
}

export default withSelect( ( select, props ) => {
	const { paymentId } = props.attributes;
	const { getEntityRecord } = select( 'core' );
	const { isSavingPost } = select( 'core/editor' );

	const simplePayment = paymentId
		? getEntityRecord( 'postType', SIMPLE_PAYMENTS_PRODUCT_POST_TYPE, paymentId )
		: undefined;

	return {
		isSaving: !! isSavingPost(),
		simplePayment,
	};
} )( Edit );
