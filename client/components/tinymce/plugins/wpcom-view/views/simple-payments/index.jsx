/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependecies
 */
import shortcodeUtils from 'lib/shortcode';
import { deserialize } from 'components/tinymce/plugins/simple-payments/shortcode-utils';
import { getSimplePayments } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import formatCurrency from 'lib/format-currency';
import QuerySimplePayments from 'components/data/query-simple-payments';

class SimplePaymentsView extends Component {
	render() {
		const { productId, product, content, siteId } = this.props;

		if ( ! product ) {
			return (
				<div className="wpview-content wpview-type-simple-payments">
					{ content }
					<QuerySimplePayments siteId={ siteId } productId={ productId } />
				</div>
			);
		}

		const { title, description, price, currency } = product;

		return (
			<div className="wpview-content wpview-type-simple-payments">
				<div className="wpview-type-simple-payments__wrapper">
					<div className="wpview-type-simple-payments__image-part">
						Image here
					</div>
					<div className="wpview-type-simple-payments__text-part">
						<div className="wpview-type-simple-payments__title">
							{ title }
						</div>
						<div
							className="wpview-type-simple-payments__description"
							dangerouslySetInnerHTML={ { __html: description } }
						>
						</div>
						<div className="wpview-type-simple-payments__price-part">
							{ formatCurrency( price, currency ) }
						</div>
						<div className="wpview-type-simple-payments__pay-part">
							<div className="wpview-type-simple-payments__pay-quantity">
								<input type="text" value="1" readOnly />
							</div>
							<div className="wpview-type-simple-payments__pay-paypal-button">
								Pay with PayPal
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

	return {
		shortcodeData,
		productId,
		siteId,
		product: getSimplePayments( state, siteId, productId ),
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
