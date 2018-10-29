/** @format */

/**
 * External dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import { Component, Fragment } from '@wordpress/element';
import { compose, withInstanceId } from '@wordpress/compose';
import { Panel, PanelBody, PanelRow } from '@wordpress/components';
import { withSelect } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';
import get from 'lodash/get';

/**
 * Internal dependencies
 */
import { SIMPLE_PAYMENTS_PRODUCT_POST_TYPE } from 'lib/simple-payments/constants';

class SimplePaymentsEdit extends Component {
	state = {
		savingProduct: false,
	};

	componentDidUpdate( prevProps ) {
		const { simplePayment, attributes, setAttributes, isSelected, isSaving } = this.props;

		if ( ! prevProps.simplePayment && simplePayment ) {
			setAttributes( {
				description: get( simplePayment, [ 'content', 'raw' ], attributes.description ),
				currency: get( simplePayment, [ 'meta', 'spay_currency' ], attributes.currency ),
				email: get( simplePayment, [ 'meta', 'spay_email' ], attributes.email ),
				formattedPrice: get(
					simplePayment,
					[ 'meta', 'spay_formatted_price' ],
					attributes.formattedPrice
				),
				multiple: get( simplePayment, [ 'meta', 'spay_multiple' ], attributes.multiple ),
				price: get( simplePayment, [ 'meta', 'spay_price' ], attributes.price ),
				title: get( simplePayment, [ 'title', 'raw' ], attributes.title ),
			} );
		}

		// Saves on block-deselect and when editor is saving a post
		if ( ( prevProps.isSelected && ! isSelected ) || ( prevProps.isSaving && ! isSaving ) ) {
			this.savePayment();
		}
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
		if ( this.state.savingProduct ) {
			return;
		}

		this.setState( { savingProduct: true } );

		const { attributes, setAttributes } = this.props;
		const { paymentId } = attributes;

		// @TODO field validation

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
		const { attributes, instanceId, isSelected } = this.props;
		const {
			currency,
			description,
			email,
			formattedPrice,
			multiple,
			paymentId,
			price,
			title,
		} = attributes;
		const baseId = `simplepayments-${ instanceId }`;
		const currencyId = `${ baseId }__currency`;
		const descriptionId = `${ baseId }__description`;
		const emailId = `${ baseId }__email`;
		const multipleId = `${ baseId }__multiple`;
		const priceId = `${ baseId }__price`;
		const titleId = `${ baseId }__title`;

		if ( ! isSelected ) {
			// @TODO component
			return (
				<Panel>
					<PanelBody>
						<Fragment>
							<PanelRow>
								<span>paymentId:</span>
								<span>{ paymentId || 'N/A' }</span>
							</PanelRow>
							<PanelRow>
								<span>title:</span>
								<span>{ title || 'N/A' }</span>
							</PanelRow>
							<PanelRow>
								<span>description:</span>
								<span>{ description || 'N/A' }</span>
							</PanelRow>
							<PanelRow>
								<span>currency:</span>
								<span>{ currency || 'N/A' }</span>
							</PanelRow>
							<PanelRow>
								<span>price:</span>
								<span>{ price || 'N/A' }</span>
							</PanelRow>
							<PanelRow>
								<span>formattedPrice:</span>
								<span>{ formattedPrice || 'N/A' }</span>
							</PanelRow>
							<PanelRow>
								<span>multiple:</span>
								<span>{ multiple || 'N/A' }</span>
							</PanelRow>
							<PanelRow>
								<span>email:</span>
								<span>{ email || 'N/A' }</span>
							</PanelRow>
						</Fragment>
					</PanelBody>
				</Panel>
			);
		}

		return (
			<Panel>
				<PanelBody>
					<Fragment>
						<PanelRow>
							<span>paymentId: { paymentId || 'N/A' }</span>
							<button onClick={ this.savePayment } style={ { float: 'right' } }>
								Save
							</button>
						</PanelRow>
						<PanelRow>
							<label htmlFor={ titleId }>{ __( 'Title' ) }</label>
							<input
								id={ titleId }
								onChange={ this.handleTitleChange }
								type="text"
								value={ title }
							/>
						</PanelRow>
						<PanelRow>
							<label htmlFor={ descriptionId }>{ __( 'Description' ) }</label>
							<textarea
								id={ descriptionId }
								onChange={ this.handleDescriptionChange }
								value={ description }
							/>
						</PanelRow>
						<PanelRow>
							<label htmlFor={ currencyId }>{ __( 'Currency' ) }</label>
							<input
								id={ currencyId }
								maxLength="3"
								onChange={ this.handleCurrencyChange }
								type="text"
								value={ currency }
							/>
						</PanelRow>
						<PanelRow>
							<label htmlFor={ priceId }>{ __( 'Price' ) }</label>
							<input
								id={ priceId }
								min={ 1 }
								onChange={ this.handlePriceChange }
								step={ 1 }
								type="number"
								value={ price || '' }
							/>
						</PanelRow>
						<PanelRow>
							<span>formattedPrice:</span>
							<span>{ formattedPrice || '' }</span>
						</PanelRow>
						<PanelRow>
							<label htmlFor={ multipleId }>{ __( 'Allow multiple' ) }</label>
							<input
								checked={ Boolean( multiple ) }
								id={ multipleId }
								onChange={ this.handleMultipleChange }
								type="checkbox"
							/>
						</PanelRow>
						<PanelRow>
							<label htmlFor={ emailId }>{ __( 'Email' ) }</label>
							<input
								id={ emailId }
								onChange={ this.handleEmailChange }
								type="email"
								value={ email }
							/>
						</PanelRow>
					</Fragment>
				</PanelBody>
			</Panel>
		);
	}
}

const applyWithSelect = withSelect( ( select, props ) => {
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
} );

export default compose( [ applyWithSelect, withInstanceId ] )( SimplePaymentsEdit );
