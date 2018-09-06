/** @format */
/**
 * External dependencies
 */
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { invoke } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import PlanIcon from 'components/plans/plan-icon';
import { isFreeJetpackPlan } from 'lib/products-values';
import { managePurchase } from 'me/purchases/paths';

export class CurrentPlanHeader extends Component {
	static propTypes = {
		siteSlug: PropTypes.string,
		title: PropTypes.string,
		tagLine: PropTypes.string,
		isPlaceholder: PropTypes.bool,
		currentPlan: PropTypes.object,
		isExpiring: PropTypes.bool,
		translate: PropTypes.func,
	};

	renderPurchaseInfo() {
		const { currentPlan, siteSlug, isExpiring, translate } = this.props;

		if ( ! currentPlan || isFreeJetpackPlan( currentPlan ) ) {
			return null;
		}

		const hasAutoRenew = !! currentPlan.autoRenew;
		const classes = classNames( 'current-plan__header-purchase-info', {
			'is-expiring': isExpiring,
		} );

		return (
			<Card className="current-plan__header-purchase-info-wrapper" compact>
				<div className={ classes }>
					<span className="current-plan__header-expires-in">
						{ hasAutoRenew && currentPlan.autoRenewDateMoment
							? translate( 'Set to auto-renew on %s.', {
									args: invoke( currentPlan, 'autoRenewDateMoment.format', 'LL' ),
							  } )
							: translate( 'Expires on %s.', {
									args: invoke( currentPlan, 'userFacingExpiryMoment.format', 'LL' ),
							  } ) }
					</span>
					{ currentPlan.userIsOwner &&
						Boolean( currentPlan.id ) &&
						siteSlug && (
							<Button compact href={ managePurchase( siteSlug, currentPlan.id ) }>
								{ hasAutoRenew ? translate( 'Manage Payment' ) : translate( 'Renew Now' ) }
							</Button>
						) }
				</div>
			</Card>
		);
	}

	render() {
		const { currentPlan, isPlaceholder, siteSlug, tagLine, title, translate } = this.props;

		const currentPlanSlug = currentPlan && currentPlan.productSlug;

		return (
			<div className="current-plan__header">
				<div className="current-plan__header-content">
					<div className="current-plan__header-content-main">
						<div className="current-plan__header-icon">
							{ currentPlanSlug && <PlanIcon plan={ currentPlanSlug } /> }
						</div>
						<div className="current-plan__header-copy">
							<h1
								className={ classNames( 'current-plan__header-heading', {
									'is-placeholder': isPlaceholder,
								} ) }
							>
								{ title }
							</h1>

							<h2
								className={ classNames( 'current-plan__header-text', {
									'is-placeholder': isPlaceholder,
								} ) }
							>
								{ tagLine }
							</h2>
						</div>
					</div>
					{ this.renderPurchaseInfo() }
					{ currentPlan &&
						isFreeJetpackPlan( currentPlan ) &&
						siteSlug && (
							<div className="current-plan__compare-plans">
								<Button href={ `/plans/${ siteSlug }` }>{ translate( 'Compare Plans' ) }</Button>
							</div>
						) }
				</div>
			</div>
		);
	}
}

export default localize( CurrentPlanHeader );
