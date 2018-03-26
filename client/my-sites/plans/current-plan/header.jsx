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
import HappinessSupport from 'components/happiness-support';
import PlanIcon from 'components/plans/plan-icon';
import {
	PLAN_PREMIUM,
	PLAN_BUSINESS,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_PERSONAL,
} from 'lib/plans/constants';
import { managePurchase } from 'me/purchases/paths';

class CurrentPlanHeader extends Component {
	static propTypes = {
		selectedSite: PropTypes.object,
		title: PropTypes.string,
		tagLine: PropTypes.string,
		isPlaceholder: PropTypes.bool,
		currentPlanSlug: PropTypes.oneOf( [
			PLAN_PREMIUM,
			PLAN_BUSINESS,
			PLAN_JETPACK_FREE,
			PLAN_JETPACK_BUSINESS,
			PLAN_JETPACK_BUSINESS_MONTHLY,
			PLAN_JETPACK_PREMIUM,
			PLAN_JETPACK_PREMIUM_MONTHLY,
			PLAN_JETPACK_PERSONAL,
			PLAN_JETPACK_PERSONAL_MONTHLY,
			PLAN_PERSONAL,
		] ).isRequired,
		currentPlan: PropTypes.object,
		isExpiring: PropTypes.bool,
		translate: PropTypes.func,
		isAutomatedTransfer: PropTypes.bool,
	};

	isEligibleForLiveChat = () => {
		const { currentPlanSlug: planSlug } = this.props;
		return planSlug === PLAN_JETPACK_BUSINESS || planSlug === PLAN_JETPACK_BUSINESS_MONTHLY;
	};

	renderPurchaseInfo() {
		const { currentPlan, currentPlanSlug, selectedSite, isExpiring, translate } = this.props;

		if ( ! currentPlan || currentPlanSlug === PLAN_JETPACK_FREE ) {
			return null;
		}

		const hasAutoRenew = currentPlan.autoRenew;
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
					{ currentPlan.userIsOwner && (
						<Button compact href={ managePurchase( selectedSite.slug, currentPlan.id ) }>
							{ hasAutoRenew ? translate( 'Manage Payment' ) : translate( 'Renew Now' ) }
						</Button>
					) }
				</div>
			</Card>
		);
	}

	render() {
		const {
			currentPlanSlug,
			includePlansLink,
			isAutomatedTransfer,
			isPlaceholder,
			title,
			tagLine,
			translate,
			selectedSite,
		} = this.props;

		return (
			<div className="current-plan__header">
				<div className="current-plan__header-item">
					<div className="current-plan__header-item-content">
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
						{ this.renderPurchaseInfo() }
						{ includePlansLink && (
							<Button
								className="current-plan__compare-plans"
								href={ '/plans/' + selectedSite.slug }
							>
								{ translate( 'Compare Plans' ) }
							</Button>
						) }
					</div>
				</div>

				<div className="current-plan__header-item">
					<div className="current-plan__header-item-content">
						<HappinessSupport
							isJetpack={ !! selectedSite.jetpack && ! isAutomatedTransfer }
							isJetpackFreePlan={ currentPlanSlug === PLAN_JETPACK_FREE }
							isPlaceholder={ isPlaceholder }
							showLiveChatButton={ this.isEligibleForLiveChat() }
							liveChatButtonEventName="calypso_plans_current_plan_chat_initiated"
						/>
					</div>
				</div>
			</div>
		);
	}
}

export default localize( CurrentPlanHeader );
