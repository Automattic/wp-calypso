/** @format */

/**
 * External dependencies
 */
import { __, _n, sprintf } from '@wordpress/i18n';
import { Component, Fragment } from '@wordpress/element';
import {
	ExternalLink,
	PanelBody,
	SelectControl,
	TextareaControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import { InspectorControls } from '@wordpress/editor';
import { withSelect } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';
import classNames from 'classnames';
import emailValidator from 'email-validator';
import get from 'lodash/get';
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

class SimplePaymentsEdit extends Component {
	state = {
		isSavingProduct: false,
		fieldTitleError: '',
		fieldPriceError: '',
		fieldEmailError: '',
	};

	componentDidUpdate( prevProps ) {
		const {
			simplePayment,
			attributes,
			setAttributes,
			isSelected,
			isSavingPost,
			isLoadingInitial,
		} = this.props;
		const { currency, price, title, email, content, multiple } = attributes;
		const { fieldEmailError, fieldPriceError, fieldTitleError } = this.state;

		// @TODO check componentDidMount for the case where post was already loaded
		if ( ! prevProps.simplePayment && simplePayment ) {
			setAttributes( {
				content: get( simplePayment, 'content.raw', content ),
				currency: get( simplePayment, 'meta.spay_currency', currency || 'USD' ),
				email: get( simplePayment, 'meta.spay_email', email ),
				multiple: Boolean( get( simplePayment, 'meta.spay_multiple', multiple || false ) ),
				price: get( simplePayment, 'meta.spay_price', price || undefined ),
				title: get( simplePayment, 'title.raw', title ),
			} );
		}

		// Validate and save on block-deselect
		if (
			prevProps.isSelected &&
			! isSelected &&
			! isLoadingInitial &&
			! isSavingPost &&
			this.validatePrice( price, currency ) &&
			this.validateTitle( title ) &&
			this.validateEmail( email )
		) {
			this.saveProduct();
		}

		// Save when editor has done saving a post (even just a draft)
		if (
			prevProps.isSavingPost &&
			! isSavingPost &&
			! isLoadingInitial &&
			! fieldEmailError &&
			! fieldPriceError &&
			! fieldTitleError
		) {
			this.saveProduct();
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
				spay_formatted_price: this.formatPrice( price, currency ),
				spay_multiple: multiple ? 1 : 0,
				spay_price: price,
			},
		};
	};

	saveProduct = async () => {
		const { attributes, setAttributes } = this.props;
		const { currency, email, paymentId, price, title } = attributes;
		const { fieldTitleError, fieldPriceError, fieldEmailError, isSavingProduct } = this.state;

		// Do not save while already saving
		// Do not save if missing required fields
		// Do not save if fields have invalid data
		if (
			isSavingProduct ||
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

		this.setState( { isSavingProduct: true } );

		const path = `/wp/v2/${ SIMPLE_PAYMENTS_PRODUCT_POST_TYPE }/${ paymentId ? paymentId : '' }`;

		try {
			// @TODO: then/catch
			const { id } = await apiFetch( {
				path,
				method: 'POST',
				data: this.attributesToPost( attributes ),
			} );

			this.setState( { isSavingProduct: false } );

			if ( id ) {
				setAttributes( { paymentId: id } );
			}
		} catch ( err ) {
			// @TODO: error handling
			// eslint-disable-next-line
			console.error( err );
			this.setState( { isSavingProduct: false } );
		}
	};

	// based on https://stackoverflow.com/a/10454560/59752
	decimalPlaces = number => {
		const match = ( '' + number ).match( /(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/ );
		if ( ! match ) {
			return 0;
		}
		return Math.max( 0, ( match[ 1 ] ? match[ 1 ].length : 0 ) - ( match[ 2 ] ? +match[ 2 ] : 0 ) );
	};

	/**
	 * Validate price
	 *
	 * Stores error message in state.fieldPriceError
	 *
	 * @param {Number} price A price
	 * @param {String} currency three-character ISO-4217 currency code
	 * @returns {Boolean} True when valid, false when invalid
	 */
	validatePrice = ( price, currency ) => {
		const { precision } = getCurrencyDefaults( currency );

		if ( ! price || parseFloat( price ) === 0 ) {
			this.setState( {
				fieldPriceError: __( 'Everything comes with a price tag these days. Add yours here.' ),
			} );
			return false;
		}

		if ( Number.isNaN( parseFloat( price ) ) ) {
			this.setState( {
				fieldPriceError: __( 'Invalid price' ),
			} );
			return false;
		}

		if ( parseFloat( price ) < 0 ) {
			this.setState( {
				fieldPriceError: __( "Your price is negative — now that doesn't sound right, does it?" ),
			} );
			return false;
		}

		if ( this.decimalPlaces( price ) > precision ) {
			if ( precision === 0 ) {
				this.setState( {
					fieldPriceError: __(
						"We know every penny counts, but prices can't contain decimal values."
					),
				} );
				return false;
			}

			this.setState( {
				fieldPriceError: sprintf(
					_n(
						'Price cannot have more than %d decimal place.',
						'Price cannot have more than %d decimal places.',
						precision
					),
					precision
				),
			} );
			return false;
		}

		if ( this.state.fieldPriceError ) {
			this.setState( { fieldPriceError: '' } );
		}

		return true;
	};

	/**
	 * Validate email
	 *
	 * Stores error message in state.fieldEmailError
	 *
	 * @param {String} email An email
	 * @returns {Boolean} True when valid, false when invalid
	 */
	validateEmail = email => {
		if ( ! email ) {
			this.setState( {
				fieldEmailError: __(
					'We want to make sure payments reach you, so please add an email address.',
					'jetpack'
				),
			} );
			return false;
		}

		if ( ! emailValidator.validate( email ) ) {
			this.setState( {
				fieldEmailError: sprintf( __( '%s is not a valid email address.' ), email ),
			} );
			return false;
		}

		if ( this.state.fieldEmailError ) {
			this.setState( { fieldEmailError: '' } );
		}

		return true;
	};

	/**
	 * Validate title
	 *
	 * Stores error message in state.fieldTitleError
	 *
	 * @param {String} title A title
	 * @returns {Boolean} True when valid, false when invalid
	 */
	validateTitle = title => {
		if ( ! title ) {
			this.setState( {
				fieldTitleError: __(
					"People need to know what they're paying for! Please add a brief title.",
					'jetpack'
				),
			} );
			return false;
		}

		if ( this.state.fieldTitleError ) {
			this.setState( { fieldTitleError: '' } );
		}

		return true;
	};

	handleEmailChange = email => {
		this.props.setAttributes( { email } );
	};

	handleContentChange = content => {
		this.props.setAttributes( { content } );
	};

	handlePriceChange = price => {
		price = parseFloat( price );
		if ( ! isNaN( price ) ) {
			this.props.setAttributes( { price } );
		} else {
			this.props.setAttributes( { price: undefined } );
		}
	};

	handleCurrencyChange = currency => {
		this.props.setAttributes( { currency } );
	};

	handleMultipleChange = multiple => {
		this.props.setAttributes( { multiple: !! multiple } );
	};

	handleTitleChange = title => {
		this.props.setAttributes( { title } );
	};

	formatPrice = ( price, currency, withSymbol = true ) => {
		const { precision, symbol } = getCurrencyDefaults( currency );
		const value = price.toFixed( precision );
		// Trim the dot at the end of symbol, e.g., 'kr.' becomes 'kr'
		return withSymbol ? `${ value } ${ trimEnd( symbol, '.' ) }` : value;
	};

	getCurrencyList = SUPPORTED_CURRENCY_LIST.map( value => {
		const { symbol } = getCurrencyDefaults( value );
		// if symbol is equal to the code (e.g., 'CHF' === 'CHF'), don't duplicate it.
		// trim the dot at the end, e.g., 'kr.' becomes 'kr'
		const label = symbol === value ? value : `${ value } ${ trimEnd( symbol, '.' ) }`;
		return { value, label };
	} );

	render() {
		const { fieldEmailError, fieldPriceError, fieldTitleError } = this.state;
		const { attributes, isSelected, isLoadingInitial } = this.props;
		const { content, currency, email, multiple, price, title } = attributes;

		if ( ! isSelected && isLoadingInitial ) {
			return (
				<div className="simple-payments__loading">
					<ProductPlaceholder content={ '█████' } formattedPrice={ '█████' } title={ '█████' } />
				</div>
			);
		}

		if (
			! isSelected &&
			currency &&
			email &&
			price &&
			title &&
			! fieldEmailError &&
			! fieldPriceError &&
			! fieldTitleError
		) {
			return (
				<ProductPlaceholder
					content={ content }
					formattedPrice={ this.formatPrice( price, currency ) }
					multiple={ multiple }
					title={ title }
				/>
			);
		}

		return (
			<div className="wp-block-jetpack-simple-payments">
				<Fragment>
					<InspectorControls key="inspector">
						<PanelBody>
							<ExternalLink href="https://support.wordpress.com/simple-payments/">
								{ __( 'Support reference' ) }
							</ExternalLink>
						</PanelBody>
					</InspectorControls>

					<TextControl
						className={ classNames( 'simple-payments__field', 'simple-payments__field-title', {
							'simple-payments__field-has-error': fieldTitleError,
						} ) }
						disabled={ isLoadingInitial }
						help={ fieldTitleError }
						label={ __( 'Item name' ) }
						onChange={ this.handleTitleChange }
						placeholder={ __( 'Item name' ) }
						required
						type="text"
						value={ title }
					/>

					<TextareaControl
						disabled={ isLoadingInitial }
						className="simple-payments__field simple-payments__field-content"
						label={ __( 'Enter a description for your item' ) }
						onChange={ this.handleContentChange }
						placeholder={ __( 'Enter a description for your item' ) }
						value={ content }
					/>

					<div className="simple-payments__price-container">
						<SelectControl
							disabled={ isLoadingInitial }
							className="simple-payments__field simple-payments__field-currency"
							label={ __( 'Currency' ) }
							onChange={ this.handleCurrencyChange }
							options={ this.getCurrencyList }
							value={ currency || 'USD' }
						/>
						<TextControl
							disabled={ isLoadingInitial }
							className={ classNames( 'simple-payments__field', 'simple-payments__field-price', {
								'simple-payments__field-has-error': fieldPriceError,
							} ) }
							help={ fieldPriceError }
							label={ __( 'Price' ) }
							onChange={ this.handlePriceChange }
							placeholder={ this.formatPrice( 0, currency, false ) }
							required
							step="1"
							type="number"
							value={ price || '' }
						/>
					</div>

					<div className="simple-payments__field-multiple">
						<ToggleControl
							disabled={ isLoadingInitial }
							checked={ Boolean( multiple ) }
							label={ __( 'Allow people buy more than one item at a time' ) }
							onChange={ this.handleMultipleChange }
						/>
					</div>

					<TextControl
						disabled={ isLoadingInitial }
						className={ classNames( 'simple-payments__field', 'simple-payments__field-email', {
							'simple-payments__field-has-error': fieldEmailError,
						} ) }
						help={ fieldEmailError ? fieldEmailError : '' }
						label={ __( 'Email' ) }
						onChange={ this.handleEmailChange }
						placeholder={ __( 'Email' ) }
						required
						type="email"
						value={ email }
					/>

					<p className="components-base-control__help">
						{ __(
							"This is where PayPal will send your money. To claim a payment, you'll " +
								'need a PayPal account connected to a bank account.',
							'jetpack'
						) }
						<br />
						<ExternalLink href="https://www.paypal.com/">
							{ __( 'Create an account at PayPal' ) }
						</ExternalLink>
					</p>
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
		isLoadingInitial: paymentId && ! simplePayment,
		isSavingPost: !! isSavingPost(),
		simplePayment,
	};
} )( SimplePaymentsEdit );
