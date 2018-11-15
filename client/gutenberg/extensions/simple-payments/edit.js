/** @format */

/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import classNames from 'classnames';
import emailValidator from 'email-validator';
import { __, _n } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import { Component, Fragment } from '@wordpress/element';
import { compose, withInstanceId } from '@wordpress/compose';
import { Field, withFormik } from 'formik';
import { get, trimEnd } from 'lodash';
import { InspectorControls } from '@wordpress/editor';
import { sprintf } from '@wordpress/i18n';
import { withSelect } from '@wordpress/data';
import {
	ExternalLink,
	PanelBody,
	SelectControl,
	TextareaControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import { decimalPlaces, formatPrice } from 'lib/simple-payments/utils';
import { getCurrencyDefaults } from 'lib/format-currency/currencies';
import {
	SIMPLE_PAYMENTS_PRODUCT_POST_TYPE,
	SUPPORTED_CURRENCY_LIST,
} from 'lib/simple-payments/constants';
import HelpMessage from './help-message';
import ProductPlaceholder from './product-placeholder';

class SimplePaymentsEdit extends Component {
	state = {
		fieldPriceError: null,
		fieldTitleError: null,
		isSavingProduct: false,
	};

	componentDidUpdate( prevProps ) {
		const { attributes, isLoadingInitial, isSelected, setAttributes, simplePayment } = this.props;
		const { content, currency, email, multiple, price, title } = attributes;

		// @TODO check componentDidMount for the case where post was already loaded
		if ( ! prevProps.simplePayment && simplePayment ) {
			setAttributes( {
				content: get( simplePayment, [ 'content', 'raw' ], content ),
				currency: get( simplePayment, [ 'meta', 'spay_currency' ], currency ),
				email: get( simplePayment, [ 'meta', 'spay_email' ], email ),
				multiple: Boolean( get( simplePayment, [ 'meta', 'spay_multiple' ], Boolean( multiple ) ) ),
				price: get( simplePayment, [ 'meta', 'spay_price' ], price || undefined ),
				title: get( simplePayment, [ 'title', 'raw' ], title ),
			} );
		}

		if ( prevProps.isSelected && ! isSelected && ! isLoadingInitial ) {
			// Validate and save on block deselect

			this.saveProduct();
		} else if ( ! prevProps.isSaving && this.props.isSaving ) {
			// Save payment on post save

			this.saveProduct();
		}
	}

	attributesToPost = attributes => {
		const { content, currency, email, multiple, price, title } = attributes;

		return {
			content,
			featured_media: 0,
			meta: {
				spay_currency: currency,
				spay_email: email,
				spay_multiple: multiple ? 1 : 0,
				spay_price: price,
			},
			status: 'publish',
			title,
		};
	};

	saveProduct() {
		if ( this.state.isSavingProduct || ! this.props.isValid ) {
			return;
		}

		const { attributes, setAttributes } = this.props;
		const { paymentId } = attributes;

		this.setState( { isSavingProduct: true }, () => {
			apiFetch( {
				path: `/wp/v2/${ SIMPLE_PAYMENTS_PRODUCT_POST_TYPE }/${ paymentId ? paymentId : '' }`,
				method: 'POST',
				data: this.attributesToPost( attributes ),
			} )
				.then( response => {
					const { id } = response;

					if ( id ) {
						setAttributes( { paymentId: id } );
					}
				} )
				.catch( error => {
					// @TODO: complete error handling
					// eslint-disable-next-line
					console.error( error );

					/*
					const {
						data: { key: apiErrorKey },
					} = error;
					*/
					// apiErrorKey === 'spay_email'
					// apiErrorKey === 'spay_price'
				} )
				.finally( () => {
					this.setState( {
						isSavingProduct: false,
					} );
				} );
		} );
	}

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

	handleEmailChange = email => {
		this.props.setFieldValue( 'email', email );
		this.props.setAttributes( { email } );
	};

	handleContentChange = content => {
		this.props.setFieldValue( 'content', content );
		this.props.setAttributes( { content } );
	};

	handlePriceChange = price => {
		this.props.setFieldValue( 'price', price );
		this.props.setAttributes( { price: parseFloat( price ) } );
	};

	handleCurrencyChange = currency => {
		this.props.setFieldValue( 'currency', currency );
		this.props.setAttributes( { currency } );
		this.props.setFieldTouched( 'price' );
	};

	handleMultipleChange = multiple => {
		this.props.setFieldValue( 'multiple', !! multiple );
		this.props.setAttributes( { multiple: !! multiple } );
	};

	handleTitleChange = title => {
		this.props.setFieldValue( 'title', title );
		this.props.setAttributes( { title } );
	};

	getCurrencyList = SUPPORTED_CURRENCY_LIST.map( value => {
		const { symbol } = getCurrencyDefaults( value );
		// if symbol is equal to the code (e.g., 'CHF' === 'CHF'), don't duplicate it.
		// trim the dot at the end, e.g., 'kr.' becomes 'kr'
		const label = symbol === value ? value : `${ value } ${ trimEnd( symbol, '.' ) }`;
		return { value, label };
	} );

	shouldShowError = ( instanceId, input ) =>
		this.props.errors[ input ] && this.props.touched[ `${ instanceId }-${ input }` ];

	render() {
		const { fieldPriceError, fieldTitleError } = this.state;
		const {
			attributes,
			errors,
			handleBlur,
			instanceId,
			isLoadingInitial,
			isSelected,
			isSubmitting,
			isValid,
			touched,
			values,
		} = this.props;
		const { content, currency, multiple, price, title } = attributes;

		if ( ! isSelected && isLoadingInitial ) {
			return (
				<div className="simple-payments__loading">
					<ProductPlaceholder
						ariaBusy="true"
						content="█████"
						formattedPrice="█████"
						title="█████"
					/>
				</div>
			);
		}

		if ( ! isSelected && ! fieldPriceError && ! fieldTitleError && isValid && price && title ) {
			return (
				<ProductPlaceholder
					ariaBusy="false"
					content={ content }
					formattedPrice={ formatPrice( price, currency ) }
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

					<Field
						className={ classNames( 'simple-payments__field', 'simple-payments__field-title', {
							'simple-payments__field-has-error': this.shouldShowError( instanceId, 'title' ),
						} ) }
						component={ TextControl }
						disabled={ isLoadingInitial || isSubmitting }
						id={ `${ instanceId }-title` }
						label={ __( 'Item name' ) }
						onBlur={ handleBlur }
						onChange={ this.handleTitleChange }
						placeholder={ __( 'Item name' ) }
						required
						value={ values.title }
					/>
					{ this.shouldShowError( instanceId, 'title' ) && (
						<HelpMessage>{ errors.title }</HelpMessage>
					) }

					<Field
						className="simple-payments__field simple-payments__field-content"
						component={ TextareaControl }
						disabled={ isLoadingInitial || isSubmitting }
						label={ __( 'Describe your item in a few words' ) }
						onBlur={ handleBlur }
						onChange={ this.handleContentChange }
						placeholder={ __( 'Describe your item in a few words' ) }
						value={ values.content }
					/>

					<div className="simple-payments__price-container">
						<Field
							className="simple-payments__field simple-payments__field-currency"
							component={ SelectControl }
							disabled={ isLoadingInitial || isSubmitting }
							label={ __( 'Currency' ) }
							onBlur={ handleBlur }
							onChange={ this.handleCurrencyChange }
							options={ this.getCurrencyList }
							value={ values.currency }
						/>
						<Field
							className={ classNames( 'simple-payments__field', 'simple-payments__field-price', {
								'simple-payments__field-has-error': errors.price && touched.price,
							} ) }
							component={ TextControl }
							disabled={ isLoadingInitial || isSubmitting }
							id={ `${ instanceId }-price` }
							label={ __( 'Price' ) }
							onBlur={ handleBlur }
							onChange={ this.handlePriceChange }
							placeholder={ formatPrice( 0, values.currency, false ) }
							required
							step="1"
							type="number"
							value={ values.price }
						/>
						{ this.shouldShowError( instanceId, 'price' ) && (
							<HelpMessage>{ errors.price }</HelpMessage>
						) }
					</div>

					<div className="simple-payments__field-multiple">
						<Field
							checked={ multiple }
							component={ ToggleControl }
							disabled={ isLoadingInitial || isSubmitting }
							label={ __( 'Allow people to buy more than one item at a time' ) }
							onBlur={ handleBlur }
							onChange={ this.handleMultipleChange }
						/>
					</div>

					<Field
						aria-describedby={
							! this.shouldShowError( instanceId, 'email' ) ? `${ instanceId }-email-help` : null
						}
						className={ classNames( 'simple-payments__field', 'simple-payments__field-email', {
							'simple-payments__field-has-error': this.shouldShowError( instanceId, 'email' ),
						} ) }
						component={ TextControl }
						disabled={ isLoadingInitial || isSubmitting }
						id={ `${ instanceId }-email` }
						label={ __( 'Email' ) }
						onBlur={ handleBlur }
						onChange={ this.handleEmailChange }
						placeholder={ __( 'Email' ) }
						required
						type="email"
						value={ values.email }
					/>
					{ this.shouldShowError( instanceId, 'email' ) && (
						<HelpMessage>{ errors.email }</HelpMessage>
					) }

					<HelpMessage id={ `${ instanceId }-email-help` } isError={ false }>
						{ __(
							'Enter the email address associated with your PayPal account. Don’t have an account?'
						) + ' ' }
						<ExternalLink href="https://www.paypal.com/">
							{ __( 'Create one on PayPal' ) }
						</ExternalLink>
					</HelpMessage>
				</Fragment>
			</div>
		);
	}
}

const applyWithSelect = withSelect( ( select, props ) => {
	const { getEntityRecord } = select( 'core' );
	const { isSavingPost } = select( 'core/editor' );

	const { paymentId } = props.attributes;

	const simplePayment = paymentId
		? getEntityRecord( 'postType', SIMPLE_PAYMENTS_PRODUCT_POST_TYPE, paymentId )
		: undefined;

	return {
		isLoadingInitial: paymentId && ! simplePayment,
		isSaving: !! isSavingPost(),
		simplePayment,
	};
} );

const validate = ( { currency, email, price, title } ) => {
	const errors = {};
	const { precision } = getCurrencyDefaults( currency );

	// Validate title
	if ( ! title ) {
		errors.title = __( 'Please add a brief title so that people know what they’re paying for.' );
	}

	// Validate email
	if ( ! email ) {
		errors.email = __( 'We want to make sure payments reach you, so please add an email address.' );
	} else if ( ! emailValidator.validate( email ) ) {
		errors.email = sprintf( __( '%s is not a valid email address.' ), email );
	}

	// Validate price
	if ( ! price || parseFloat( price ) === 0 ) {
		errors.price = __( 'If you’re selling something, you need a price tag. Add yours here.' );
	} else if ( Number.isNaN( parseFloat( price ) ) ) {
		errors.price = __( 'Invalid price' );
	} else if ( parseFloat( price ) < 0 ) {
		errors.price = __(
			'Your price is negative — enter a positive number so people can pay the right amount.'
		);
	} else if ( decimalPlaces( price ) > precision ) {
		errors.price =
			precision === 0
				? __(
						'We know every penny counts, but prices in this currency can’t contain decimal values.'
				  )
				: sprintf(
						_n(
							'The price cannot have more than %d decimal place.',
							'The price cannot have more than %d decimal places.',
							precision
						),
						precision
				  );
	}

	return errors;
};

const mapPropsToValues = ( { attributes } ) => ( {
	content: attributes.content,
	currency: attributes.currency,
	email: attributes.email,
	multiple: attributes.multiple,
	price: attributes.price,
	title: attributes.title,
} );

const formikEnhancer = withFormik( {
	validate,
	mapPropsToValues,
	// Find the component in React DevTools by this name
	displayName: 'SimplePaymentForm',
} );

export default compose( [ applyWithSelect, withInstanceId, formikEnhancer ] )( SimplePaymentsEdit );
