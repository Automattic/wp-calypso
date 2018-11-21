/** @format */

/**
 * External dependencies
 */
import classNames from 'classnames';
import emailValidator from 'email-validator';
import { Component } from '@wordpress/element';
import { compose, withInstanceId } from '@wordpress/compose';
import { dispatch, withSelect } from '@wordpress/data';
import { get, trimEnd } from 'lodash';
import { sprintf } from '@wordpress/i18n';
import {
	Disabled,
	ExternalLink,
	SelectControl,
	TextareaControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import HelpMessage from './help-message';
import ProductPlaceholder from './product-placeholder';
import { __, _n } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import { decimalPlaces, formatPrice } from 'lib/simple-payments/utils';
import { getCurrencyDefaults } from 'lib/format-currency/currencies';
import {
	SIMPLE_PAYMENTS_PRODUCT_POST_TYPE,
	SUPPORTED_CURRENCY_LIST,
} from 'lib/simple-payments/constants';

class SimplePaymentsEdit extends Component {
	state = {
		fieldEmailError: null,
		fieldPriceError: null,
		fieldTitleError: null,
		isSavingProduct: false,
	};

	componentDidMount() {
		this.injectPaymentAttributes();
	}

	componentDidUpdate( prevProps ) {
		const { hasPublishAction, isSelected } = this.props;

		if ( prevProps.simplePayment !== this.props.simplePayment ) {
			this.injectPaymentAttributes();
		}

		if ( ! prevProps.isSaving && this.props.isSaving && hasPublishAction ) {
			// Validate and save product on post save
			this.saveProduct();
		} else if ( prevProps.isSelected && ! isSelected ) {
			// Validate on block deselect
			this.validateAttributes();
		}
	}

	injectPaymentAttributes() {
		const { attributes, setAttributes, simplePayment } = this.props;
		const { paymentId, content, currency, email, multiple, price, title } = attributes;

		if ( paymentId && simplePayment ) {
			setAttributes( {
				content: get( simplePayment, [ 'content', 'raw' ], content ),
				currency: get( simplePayment, [ 'meta', 'spay_currency' ], currency ),
				email: get( simplePayment, [ 'meta', 'spay_email' ], email ),
				multiple: Boolean( get( simplePayment, [ 'meta', 'spay_multiple' ], Boolean( multiple ) ) ),
				price: get( simplePayment, [ 'meta', 'spay_price' ], price || undefined ),
				title: get( simplePayment, [ 'title', 'raw' ], title ),
			} );
		}
	}

	toApi() {
		const { attributes } = this.props;
		const { content, currency, email, multiple, paymentId, price, title } = attributes;

		return {
			id: paymentId,
			content,
			featured_media: 0,
			meta: {
				spay_currency: currency,
				spay_email: email,
				spay_multiple: multiple,
				spay_price: price,
			},
			status: 'publish',
			title,
		};
	}

	saveProduct() {
		if ( this.state.isSavingProduct ) {
			return;
		}

		if ( ! this.validateAttributes() ) {
			return;
		}

		const { attributes, setAttributes } = this.props;
		const { email } = attributes;
		const { saveEntityRecord } = dispatch( 'core' );

		this.setState( { isSavingProduct: true }, async () => {
			saveEntityRecord( 'postType', SIMPLE_PAYMENTS_PRODUCT_POST_TYPE, this.toApi() )
				.then( record => {
					if ( record ) {
						setAttributes( { paymentId: record.id } );
					}

					return record;
				} )
				.catch( error => {
					// @TODO: complete error handling
					/* eslint-disable-next-line no-console */
					console.error( error );

					const {
						data: { key: apiErrorKey },
					} = error;

					// @TODO errors in other fields
					this.setState( {
						fieldEmailError:
							apiErrorKey === 'spay_email'
								? sprintf( __( '%s is not a valid email address.' ), email )
								: null,
						fieldPriceError: apiErrorKey === 'spay_price' ? __( 'Invalid price.' ) : null,
					} );
				} )
				.finally( () => {
					this.setState( {
						isSavingProduct: false,
					} );
				} );
		} );
	}

	validateAttributes = () => {
		const isPriceValid = this.validatePrice();
		const isTitleValid = this.validateTitle();
		const isEmailValid = this.validateEmail();
		const isCurrencyValid = this.validateCurrency();

		return isPriceValid && isTitleValid && isEmailValid && isCurrencyValid;
	};

	/**
	 * Validate currency
	 *
	 * This method does not include validation UI. Currency selection should not allow for invalid
	 * values. It is primarily to ensure that the currency is valid to save.
	 *
	 * @return  {boolean} True if currency is valid
	 */
	validateCurrency = () => {
		const { currency } = this.props.attributes;
		return SUPPORTED_CURRENCY_LIST.includes( currency );
	};

	/**
	 * Validate price
	 *
	 * Stores error message in state.fieldPriceError
	 *
	 * @returns {Boolean} True when valid, false when invalid
	 */
	validatePrice = () => {
		const { currency, price } = this.props.attributes;
		const { precision } = getCurrencyDefaults( currency );

		if ( ! price || parseFloat( price ) === 0 ) {
			this.setState( {
				fieldPriceError: __( 'If you’re selling something, you need a price tag. Add yours here.' ),
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
				fieldPriceError: __(
					'Your price is negative — enter a positive number so people can pay the right amount.'
				),
			} );
			return false;
		}

		if ( decimalPlaces( price ) > precision ) {
			if ( precision === 0 ) {
				this.setState( {
					fieldPriceError: __(
						'We know every penny counts, but prices in this currency can’t contain decimal values.'
					),
				} );
				return false;
			}

			this.setState( {
				fieldPriceError: sprintf(
					_n(
						'The price cannot have more than %d decimal place.',
						'The price cannot have more than %d decimal places.',
						precision
					),
					precision
				),
			} );
			return false;
		}

		if ( this.state.fieldPriceError ) {
			this.setState( { fieldPriceError: null } );
		}

		return true;
	};

	/**
	 * Validate email
	 *
	 * Stores error message in state.fieldEmailError
	 *
	 * @returns {Boolean} True when valid, false when invalid
	 */
	validateEmail = () => {
		const { email } = this.props.attributes;
		if ( ! email ) {
			this.setState( {
				fieldEmailError: __(
					'We want to make sure payments reach you, so please add an email address.'
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
			this.setState( { fieldEmailError: null } );
		}

		return true;
	};

	/**
	 * Validate title
	 *
	 * Stores error message in state.fieldTitleError
	 *
	 * @returns {Boolean} True when valid, false when invalid
	 */
	validateTitle = () => {
		const { title } = this.props.attributes;
		if ( ! title ) {
			this.setState( {
				fieldTitleError: __(
					'Please add a brief title so that people know what they’re paying for.'
				),
			} );
			return false;
		}

		if ( this.state.fieldTitleError ) {
			this.setState( { fieldTitleError: null } );
		}

		return true;
	};

	handleEmailChange = email => {
		this.props.setAttributes( { email } );
		this.setState( { fieldEmailError: null } );
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
		this.setState( { fieldPriceError: null } );
	};

	handleCurrencyChange = currency => {
		this.props.setAttributes( { currency } );
	};

	handleMultipleChange = multiple => {
		this.props.setAttributes( { multiple: !! multiple } );
	};

	handleTitleChange = title => {
		this.props.setAttributes( { title } );
		this.setState( { fieldTitleError: null } );
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
		const { attributes, instanceId, isSelected, simplePayment } = this.props;
		const { content, currency, email, multiple, paymentId, price, title } = attributes;

		const isLoading = paymentId && ! simplePayment;
		if ( ! isSelected && isLoading ) {
			return (
				<div className="simple-payments__loading">
					<ProductPlaceholder
						aria-busy="true"
						content="█████"
						formattedPrice="█████"
						title="█████"
					/>
				</div>
			);
		}

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
				<ProductPlaceholder
					aria-busy="false"
					content={ content }
					formattedPrice={ formatPrice( price, currency ) }
					multiple={ multiple }
					title={ title }
				/>
			);
		}

		const Wrapper = isLoading ? Disabled : 'div';

		return (
			<Wrapper className="wp-block-jetpack-simple-payments">
				<TextControl
					aria-describedby={ `${ instanceId }-title-error` }
					className={ classNames( 'simple-payments__field', 'simple-payments__field-title', {
						'simple-payments__field-has-error': fieldTitleError,
					} ) }
					label={ __( 'Item name' ) }
					onChange={ this.handleTitleChange }
					placeholder={ __( 'Item name' ) }
					required
					type="text"
					value={ title }
				/>
				<HelpMessage id={ `${ instanceId }-title-error` } isError>
					{ fieldTitleError }
				</HelpMessage>

				<TextareaControl
					className="simple-payments__field simple-payments__field-content"
					label={ __( 'Describe your item in a few words' ) }
					onChange={ this.handleContentChange }
					placeholder={ __( 'Describe your item in a few words' ) }
					value={ content }
				/>

				<div className="simple-payments__price-container">
					<SelectControl
						className="simple-payments__field simple-payments__field-currency"
						label={ __( 'Currency' ) }
						onChange={ this.handleCurrencyChange }
						options={ this.getCurrencyList }
						value={ currency }
					/>
					<TextControl
						aria-describedby={ `${ instanceId }-price-error` }
						className={ classNames( 'simple-payments__field', 'simple-payments__field-price', {
							'simple-payments__field-has-error': fieldPriceError,
						} ) }
						label={ __( 'Price' ) }
						onChange={ this.handlePriceChange }
						placeholder={ formatPrice( 0, currency, false ) }
						required
						step="1"
						type="number"
						value={ price || '' }
					/>
					<HelpMessage id={ `${ instanceId }-price-error` } isError>
						{ fieldPriceError }
					</HelpMessage>
				</div>

				<div className="simple-payments__field-multiple">
					<ToggleControl
						checked={ Boolean( multiple ) }
						label={ __( 'Allow people to buy more than one item at a time' ) }
						onChange={ this.handleMultipleChange }
					/>
				</div>

				<TextControl
					aria-describedby={ `${ instanceId }-email-${ fieldEmailError ? 'error' : 'help' }` }
					className={ classNames( 'simple-payments__field', 'simple-payments__field-email', {
						'simple-payments__field-has-error': fieldEmailError,
					} ) }
					label={ __( 'Email' ) }
					onChange={ this.handleEmailChange }
					placeholder={ __( 'Email' ) }
					required
					type="email"
					value={ email }
				/>
				<HelpMessage id={ `${ instanceId }-email-error` } isError>
					{ fieldEmailError }
				</HelpMessage>
				<HelpMessage id={ `${ instanceId }-email-help` }>
					{ __(
						'Enter the email address associated with your PayPal account. Don’t have an account?'
					) + ' ' }
					<ExternalLink href="https://www.paypal.com/">
						{ __( 'Create one on PayPal' ) }
					</ExternalLink>
				</HelpMessage>
			</Wrapper>
		);
	}
}

const mapSelectToProps = withSelect( ( select, props ) => {
	const { getEntityRecord } = select( 'core' );
	const { isSavingPost, getCurrentPost } = select( 'core/editor' );

	const { paymentId } = props.attributes;

	const simplePayment = paymentId
		? getEntityRecord( 'postType', SIMPLE_PAYMENTS_PRODUCT_POST_TYPE, paymentId )
		: undefined;

	return {
		hasPublishAction: !! get( getCurrentPost(), [ '_links', 'wp:action-publish' ] ),
		isSaving: !! isSavingPost(),
		simplePayment,
	};
} );

export default compose(
	mapSelectToProps,
	withInstanceId
)( SimplePaymentsEdit );
