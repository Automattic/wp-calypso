/** @format */

/** @TODO remove */
/* eslint-disable no-console */

/**
 * External dependencies
 */
import { Component, Fragment } from '@wordpress/element';
import { compose, withInstanceId } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import { SIMPLE_PAYMENTS_PRODUCT_POST_TYPE } from 'lib/simple-payments/constants';

/**
 * @FIXME: toFixed should be replaced with proper decimal calculations. See simple-payments/form
 * const { precision } = getCurrencyDefaults( values.currency );
 */

class Edit extends Component {
	componentDidUpdate( prevProps ) {
		// Save on deselect
		// @FIXME: Do not allow multiple saves to be in flight
		if ( prevProps.isSelected && ! this.props.isSelected ) {
			const { attributes, setAttributes, siteId } = this.props;
			const { paymentId } = attributes;

			// @TODO field validation

			// Save a new Payment
			if ( ! paymentId ) {
				createPaymentButton( siteId, attributesToWpcomPost( attributes ) )
					.then( ( { ID } ) => {
						// update loaded simplePayment for diffing?
						setAttributes( { paymentId: ID } );
					} )
					.catch( err => console.error( err ) );
			} else if (
				true /* @TODO update only when dirty: ! isShallowEqual( attributes, simplePayment ) */
			) {
				updatePaymentButton( siteId, paymentId, attributesToWpcomPost( attributes ) )
					.then( () => {
						// update loaded simplePayment for diffing?
						console.log( 'updated!' );
					} )
					.catch( err => console.error( err ) );
			}
		}
	}

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

export default compose(
	withSelect( select => {
		let siteId = null;
		try {
			// @FIXME: We need a sane way to find the siteId on WordPress.com
			siteId = +select( 'core/editor' )
				.getCurrentPost()
				._links.self.map( ( { href } ) => href )
				.filter( Boolean )
				.map( s => /wp\/v2\/sites\/(\d+)\/post/.exec( s )[ 1 ] )
				.shift();
		} catch ( err ) {}
		return {
			siteId,
		};
	} ),
	withInstanceId
)( Edit );

/* eslint-disable valid-jsdoc */
/**
 * eslint-disable valid-jsdoc
 * @FIXME @TODO
 *
 * This is copied from components/tinymce/plugins/simple-payments/dialog/index.jsx
 *
 * It is not a long term solution and should be replaced by a gutenberg, WP Admin
 * inclusive solution
 */
function updatePaymentButton( siteId, paymentId, customPost ) {
	return wpcom
		.site( siteId )
		.post( paymentId )
		.update( customPost )
		.then( result => ( console.log( result ), result ), err => ( console.error( err ), err ) );
}

/**
 * @FIXME @TODO
 *
 * This is copied from components/tinymce/plugins/simple-payments/dialog/index.jsx
 *
 * It is not a long term solution and should be replaced by a gutenberg, WP Admin
 * inclusive solution
 */
function createPaymentButton( siteId, customPost ) {
	return wpcom
		.site( siteId )
		.addPost( customPost )
		.then( result => ( console.log( result ), result ), err => ( console.error( err ), err ) );
}
/* eslint-enable valid-jsdoc */

function attributesToWpcomPost( attributes ) {
	const { title, description, price, email } = attributes;

	return {
		type: SIMPLE_PAYMENTS_PRODUCT_POST_TYPE,
		metadata: [
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
		title,
		content: description,
		featured_image: '',
	};
}
