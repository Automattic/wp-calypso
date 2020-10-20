/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import Gridicon from 'calypso/components/gridicon';
import formatCurrency from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import FormTextInput from 'calypso/components/forms/form-text-input';
import { next } from 'calypso/lib/shortcode';
import { deserialize } from 'calypso/components/tinymce/plugins/simple-payments/shortcode-utils';
import getMediaItem from 'calypso/state/selectors/get-media-item';
import getSimplePayments from 'calypso/state/selectors/get-simple-payments';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import QuerySimplePayments from 'calypso/components/data/query-simple-payments';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QueryMedia from 'calypso/components/data/query-media';
import { getCurrentPlan, hasFeature } from 'calypso/state/sites/plans/selectors';
import { FEATURE_SIMPLE_PAYMENTS } from 'calypso/lib/plans/constants';

class SimplePaymentsView extends Component {
	render() {
		const { productId, product, siteId } = this.props;

		return (
			<div className="wpview-content wpview-type-simple-payments">
				<QuerySimplePayments siteId={ siteId } productId={ productId } />
				<QuerySitePlans siteId={ siteId } />
				{ product && (
					<QueryMedia
						siteId={ siteId }
						mediaId={ product.featuredImageId === '' ? 0 : parseInt( product.featuredImageId ) }
					/>
				) }
				{ this.renderContent() }
			</div>
		);
	}

	renderContent() {
		const { translate, product, productImage, planHasSimplePaymentsFeature, sitePlan } = this.props;

		if ( ! product || ! sitePlan ) {
			return;
		}

		if ( ! planHasSimplePaymentsFeature ) {
			return (
				<div className="wpview-type-simple-payments__unsupported">
					<div className="wpview-type-simple-payments__unsupported-icon">
						<Gridicon icon="cross" />
					</div>
					<p className="wpview-type-simple-payments__unsupported-message">
						{ translate( "Your plan doesn't include Pay with PayPal" ) }
					</p>
				</div>
			);
		}

		const { title, description, price, currency, multiple } = product;

		return (
			<div className="wpview-type-simple-payments__wrapper">
				{ productImage && (
					<div className="wpview-type-simple-payments__image-part">
						<figure className="wpview-type-simple-payments__image-figure">
							<img
								className="wpview-type-simple-payments__image"
								src={ productImage.URL }
								alt={ description }
							/>
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
								<FormTextInput
									className="wpview-type-simple-payments__pay-quantity-input"
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
		);
	}
}

const EnhancedSimplePaymentsView = connect( ( state, props ) => {
	const { content: shortcode } = props;

	const shortcodeData = deserialize( shortcode );

	const { id: productId = null } = shortcodeData;
	const siteId = getSelectedSiteId( state );
	const sitePlan = getCurrentPlan( state, siteId );
	const product = getSimplePayments( state, siteId, productId );

	return {
		shortcodeData,
		productId,
		siteId,
		sitePlan,
		product,
		productImage: getMediaItem( state, siteId, get( product, 'featuredImageId' ) ),
		planHasSimplePaymentsFeature: hasFeature( state, siteId, FEATURE_SIMPLE_PAYMENTS ),
	};
} )( localize( SimplePaymentsView ) );

EnhancedSimplePaymentsView.match = ( content ) => {
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

EnhancedSimplePaymentsView.serialize = ( content ) => {
	return encodeURIComponent( content );
};

EnhancedSimplePaymentsView.edit = ( editor, content ) => {
	editor.execCommand( 'simplePaymentsButton', content );
};

export default EnhancedSimplePaymentsView;
