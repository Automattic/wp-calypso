/**
 * External Dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import moment from 'moment';

/**
 * Internal Dependencies
 */
import {
	isJetpackPlanSlug,
	isJetpackBackupSlug,
	isJetpackScanSlug,
	isJetpackSearch,
} from '@automattic/calypso-products';

import { getProductBySlug } from 'calypso/state/products-list/selectors';
import JetpackBenefits from 'calypso/blocks/jetpack-benefits';
import JetpackGeneralBenefits from 'calypso/blocks/jetpack-benefits/general-benefits';
import { isPartnerPurchase } from 'calypso/lib/purchases';

// Show the benefits that this user will be losing if they cancel now
class JetpackBenefitsStep extends React.Component {
	renderTimeRemainingString() {
		const { product, purchase } = this.props;

		// if this product/ plan is partner managed, it won't really "expire" from the user's perspective
		if ( isPartnerPurchase( purchase ) || ! purchase.expiryDate ) {
			return (
				<React.Fragment>
					Your <strong>{ product.product_name }</strong> subscription is still active. <br />
				</React.Fragment>
			);
		}

		// account for the edge case that the plan expires today (or somehow already expired)
		// in this case, do not show the time remaining for the plan
		const timeRemaining = this.getTimeRemainingForSubscription();
		if ( timeRemaining.days() <= 1 ) {
			return null;
		}

		// show how much time is left on the plan
		return (
			<React.Fragment>
				You still have <strong>{ this.getTimeRemainingForSubscriptionAsString() }</strong> left on
				your <strong>{ product.product_name }</strong> subscription. <br />
			</React.Fragment>
		);
	}

	render() {
		const { siteId, productSlug } = this.props;

		return (
			<React.Fragment>
				<div className="cancel-jetpack-form__section-header dialog__header">
					<h2 className="cancel-jetpack-form__step-headline jetpack-benefits__section-title">
						Are you sure you want to cancel?
					</h2>
					<p className="cancel-jetpack-form__step-summary jetpack-benefits__section-description">
						{ this.renderTimeRemainingString() } Once you cancel{ ' ' }
						{ this.getCancelConsequenceByProduct() }
					</p>
				</div>

				<JetpackBenefits siteId={ siteId } productSlug={ productSlug } />

				{ isJetpackPlanSlug( productSlug ) && ( // show general benefits for plans
					<div className="cancel-jetpack-form__jetpack-general-benefits">
						<p className="cancel-jetpack-form__jetpack-general-benefits-title">
							Additionally, you will loose access to:
						</p>
						<JetpackGeneralBenefits productSlug={ productSlug } />
					</div>
				) }
			</React.Fragment>
		);
	}

	getTimeRemainingForSubscription() {
		const { purchase } = this.props;
		const purchaseExpiryDate = moment( purchase.expiryDate );

		return moment.duration( purchaseExpiryDate.diff( moment( purchase.mostRecentRenewDate ) ) );
	}

	getTimeRemainingForSubscriptionAsString() {
		const timeRemaining = this.getTimeRemainingForSubscription();

		if ( timeRemaining.months() >= 1 ) {
			return (
				timeRemaining.months().toString() + ' month' + ( timeRemaining.months() > 1 ? 's' : '' )
			);
		} else if ( timeRemaining.weeks() >= 1 ) {
			return timeRemaining.weeks().toString() + ' week' + ( timeRemaining.weeks() > 1 ? 's' : '' );
		}

		return timeRemaining.days().toString() + ' day' + ( timeRemaining.days() > 1 ? 's' : '' );
	}

	getCancelConsequenceByProduct() {
		const { productSlug } = this.props;

		if ( isJetpackScanSlug( productSlug ) ) {
			return ' your site will no longer have automatic protection from threats.';
		} else if ( isJetpackBackupSlug( productSlug ) ) {
			return ' you will lose access to your site backups.';
		} else if ( isJetpackSearch( productSlug ) ) {
			return " you will no longer have Jetpack's enhanced search experience.";
		}

		return ' you will lose access to the following:';
	}
}

export default connect( ( state, { siteId, purchase } ) => {
	const productSlug = purchase.productSlug;
	const product = getProductBySlug( state, productSlug );

	return {
		siteId: siteId,
		purchase: purchase,
		product: product,
		productSlug: productSlug,
	};
}, {} )( localize( JetpackBenefitsStep ) );
