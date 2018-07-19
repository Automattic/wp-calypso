/** @format **/
/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import { next } from 'lib/shortcode';
import { deserialize } from 'components/tinymce/plugins/simple-payments/shortcode-utils';
import getMediaItem from 'state/selectors/get-media-item';
import getSimplePayments from 'state/selectors/get-simple-payments';
import { getSelectedSiteId } from 'state/ui/selectors';
import formatCurrency from 'lib/format-currency';
import QuerySimplePayments from 'components/data/query-simple-payments';
import QueryMedia from 'components/data/query-media';
import QuerySitePlans from 'components/data/query-site-plans';
import { hasFeature, getSitePlanSlug } from 'state/sites/plans/selectors';
import { FEATURE_SIMPLE_PAYMENTS } from 'lib/plans/constants';

class SimplePaymentsView extends Component {
	render() {
		const {
			translate,
			productId,
			product,
			siteId,
			shouldQuerySitePlans,
			planHasSimplePaymentsFeature,
		} = this.props;

		if ( ! product ) {
			return <QuerySimplePayments siteId={ siteId } productId={ productId } />;
		}

		if ( shouldQuerySitePlans ) {
			return <QuerySitePlans siteId={ siteId } />;
		}

		if ( ! shouldQuerySitePlans && ! planHasSimplePaymentsFeature ) {
			return (
				<div className="wpview-content wpview-type-simple-payments">
					<div className="wpview-type-simple-payments__unsupported">
						<div className="wpview-type-simple-payments__unsupported-icon">
							<Gridicon icon="cross" />
						</div>
						<p className="wpview-type-simple-payments__unsupported-message">
							{ translate( "Your plan doesn't include Simple Payments." ) }
						</p>
					</div>
				</div>
			);
		}

		const { productImage } = this.props;
		const {
			title,
			description,
			price,
			currency,
			multiple,
			featuredImageId: productImageId,
		} = product;

		return (
			<div className="wpview-content wpview-type-simple-payments">
				{ productImageId && <QueryMedia siteId={ siteId } mediaId={ productImageId } /> }
				<div className="wpview-type-simple-payments__wrapper">
					{ productImage && (
						<div className="wpview-type-simple-payments__image-part">
							<figure className="wpview-type-simple-payments__image-figure">
								<img className="wpview-type-simple-payments__image" src={ productImage.URL } />
							</figure>
						</div>
					) }
					<div className="wpview-type-simple-payments__text-part">
						<div className="wpview-type-simple-payments__title">{ title }</div>
						<div className="wpview-type-simple-payments__description">{ description }</div>
						<div className="wpview-type-simple-payments__price-part">
							{ formatCurrency( price, currency ) }
						</div>
						<div className="wpview-type-simple-payments__pay-part">
							{ multiple && (
								<div className="wpview-type-simple-payments__pay-quantity">
									<input
										className="wpview-type-simple-payments__pay-quantity-input"
										type="text"
										value="1"
										readOnly
									/>
								</div>
							) }
							<div className="wpview-type-simple-payments__pay-paypal-button-wrapper">
								<div className="wpview-type-simple-payments__pay-paypal-button-content">
									<span className="wpview-type-simple-payments__pay-paypal-button-text">
										{ translate( 'Pay with' ) }
									</span>
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
		shouldQuerySitePlans: getSitePlanSlug( state, siteId ) === null,
		planHasSimplePaymentsFeature: hasFeature( state, siteId, FEATURE_SIMPLE_PAYMENTS ),
	};
} )( localize( SimplePaymentsView ) );

SimplePaymentsView.match = content => {
	const match = next( 'simple-payment', content );

	if ( match ) {
		return {
			index: match.index,
			content: match.content,
			options: {
				shortcode: match.shortcode,
			},
		};
	}
};

SimplePaymentsView.serialize = content => {
	return encodeURIComponent( content );
};

SimplePaymentsView.edit = ( editor, content ) => {
	editor.execCommand( 'simplePaymentsButton', content );
};

export default SimplePaymentsView;
