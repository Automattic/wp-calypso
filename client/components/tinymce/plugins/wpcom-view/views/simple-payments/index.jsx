/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependecies
 */
import shortcodeUtils from 'lib/shortcode';
import { deserialize } from 'components/tinymce/plugins/simple-payments/shortcode-utils';
import { getSimplePayments } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import formatCurrency from 'lib/format-currency';
import QuerySimplePayments from 'components/data/query-simple-payments';
import QueryMedia from 'components/data/query-media';
import { getMediaItem } from 'state/selectors';

class SimplePaymentsView extends Component {
	render() {
		const { productId, product, siteId, productImage } = this.props;

		if ( ! product ) {
			return ( <QuerySimplePayments siteId={ siteId } productId={ productId } /> );
		}

		const { title, description, price, currency, featuredImageId: productImageId } = product;

		// TODO: make proper icon and store on some proper place.
		const paypalButtonImageUrl = 'https://cldup.com/DoIAwrACBs.png';

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
							<div className="wpview-type-simple-payments__pay-quantity">
								<input
									className="wpview-type-simple-payments__pay-quantity-input"
									type="text"
									value="1"
									readOnly
								/>
							</div>
							<div className="wpview-type-simple-payments__pay-paypal-button-wrapper">
								<img
									className="wpview-type-simple-payments__pay-paypal-button"
									src={ paypalButtonImageUrl }
								/>
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
