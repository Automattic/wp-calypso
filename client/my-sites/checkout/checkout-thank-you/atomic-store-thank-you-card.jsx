/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import PlanThankYouCard from 'blocks/plan-thank-you-card';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { getCurrentPlan } from 'state/sites/plans/selectors';
import { getPlanClass } from 'lib/plans';

class AtomicStoreThankYouCard extends Component {
	renderAction() {
		const { site, translate } = this.props;

		return (
			<div className="checkout-thank-you__atomic-store-action-buttons">
				<a
					className={ classNames( 'button', 'thank-you-card__button' ) }
					href={ site.URL + '/wp-admin/admin.php?page=wc-setup&calypsoify=1' }
				>
					{ translate( 'Create your store!' ) }
				</a>
			</div>
		);
	}

	render() {
		const { translate, siteId, planClass } = this.props;

		const classes = classNames( 'checkout-thank-you__atomic-store', planClass );

		return (
			<div className={ classes }>
				<PlanThankYouCard
					siteId={ siteId }
					action={ this.renderAction() }
					heading={ translate( 'Thank you for your purchase!' ) }
					description={ translate(
						"Now that we've taken care of the plan, it's time to start setting up your store"
					) }
				/>
			</div>
		);
	}
}

export default connect( state => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );
	const plan = getCurrentPlan( state, siteId );
	const planClass = plan && plan.productSlug ? getPlanClass( plan.productSlug ) : '';

	return {
		siteId,
		site,
		planClass,
	};
} )( localize( AtomicStoreThankYouCard ) );
