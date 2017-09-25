/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import QueryMedia from 'components/data/query-media';
import QuerySimplePayments from 'components/data/query-simple-payments';
import { deserialize } from 'components/tinymce/plugins/simple-payments/shortcode-utils';
import formatCurrency from 'lib/format-currency';
import shortcodeUtils from 'lib/shortcode';
import { getSimplePayments } from 'state/selectors';
import { getMediaItem } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

class SimplePaymentsView extends Component {
	render() {
		const { translate, productId, product, siteId } = this.props;

		if ( ! product ) {
			return ( <QuerySimplePayments siteId={ siteId } productId={ productId } /> );
		}

		const { productImage } = this.props;
		const { title, description, price, currency, multiple, featuredImageId: productImageId } = product;

		return (
			<div className="wpview-content wpview-type-simple-payments">
				{ productImageId && <QueryMedia siteId={ siteId } mediaId={ productImageId } /> }
				<div className="wpview-type-simple-payments__wrapper">
				{ productImage &&
					<div className="wpview-type-simple-payments__image-part">
						<figure className="wpview-type-simple-payments__image-figure">
							<img
								className="wpview-type-simple-payments__image"
								src={ productImage.URL }
							/>
						</figure>
					</div>
				}
					<div className="wpview-type-simple-payments__text-part">
						<div className="wpview-type-simple-payments__title">
							{ title }
						</div>
						<div className="wpview-type-simple-payments__description">
							{ description }
						</div>
						<div className="wpview-type-simple-payments__price-part">
							{ formatCurrency( price, currency ) }
						</div>
						<div className="wpview-type-simple-payments__pay-part">
							{ multiple &&
							<div className="wpview-type-simple-payments__pay-quantity">
								<input
									className="wpview-type-simple-payments__pay-quantity-input"
									type="text"
									value="1"
									readOnly
								/>
							</div>
							}
							<div className="wpview-type-simple-payments__pay-paypal-button-wrapper">
								<div className="wpview-type-simple-payments__pay-paypal-button-content">
									<span className="wpview-type-simple-payments__pay-paypal-button-text">{ translate( 'Pay with' ) }</span>
									<span className="wpview-type-simple-payments_paypal-logo" />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

SimplePaymentsView = connect( ( state, props ) => {
	const { content: shortcode } = props;

	const shortcodeData = deserialize( shortcode );

	const { id: productId = null } = shortcodeData;
	const siteId = getSelectedSiteId( state );
	const product = getSimplePayments( state, siteId, productId );

	return {
		shortcodeData,
		productId,
		siteId,
		product,
		productImage: getMediaItem( state, siteId, get( product, 'featuredImageId' ) ),
	};
} )( localize( SimplePaymentsView ) );

SimplePaymentsView.match = ( content ) => {
	const match = shortcodeUtils.next( 'simple-payment', content );

	if ( match ) {
		return {
			index: match.index,
			content: match.content,
			options: {
				shortcode: match.shortcode
			}
		};
	}
};

SimplePaymentsView.serialize = ( content ) => {
	return encodeURIComponent( content );
};

SimplePaymentsView.edit = ( editor, content ) => {
	editor.execCommand( 'simplePaymentsButton', content );
};

export default SimplePaymentsView;
