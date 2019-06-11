/** @format */

/**
 * External dependencies
 */

import React, { Component, Fragment } from 'react';
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
import { getCurrentUserEmail, isCurrentUserEmailVerified } from 'state/current-user/selectors';

class AtomicStoreThankYouCard extends Component {
	resendEmail = () => {
		//@todo: resend email
	};

	renderAction = () => {
		const { isEmailVerified, site, translate } = this.props;

		if ( ! isEmailVerified ) {
			return (
				<div className="checkout-thank-you__atomic-store-action-buttons">
					<button
						className={ classNames( 'button', 'thank-you-card__button' ) }
						onClick={ this.resendEmail }
					>
						{ translate( 'Resend Email' ) }
					</button>
				</div>
			);
		}

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
	};

	renderDescription() {
		const { emailAddress, isEmailVerified, translate } = this.props;

		if ( ! isEmailVerified ) {
			return (
				<Fragment>
					<div>
						{ translate(
							'Now that we have taken care of your plan, we need to verify your email address to create your store.'
						) }
					</div>
					<div className="checkout-thank-you__atomic-store-email-instruction">
						{ translate( 'Please click the link in the email we sent to %(emailAddress)s.', {
							args: { emailAddress },
						} ) }
					</div>
				</Fragment>
			);
		}

		return translate(
			"Now that we've taken care of the plan, it's time to start setting up your store"
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
					description={ this.renderDescription() }
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
	const emailAddress = getCurrentUserEmail( state );
	const isEmailVerified = isCurrentUserEmailVerified( state );

	return {
		siteId,
		site,
		emailAddress,
		isEmailVerified,
		planClass,
	};
} )( localize( AtomicStoreThankYouCard ) );
