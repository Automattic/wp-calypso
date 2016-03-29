/**
 * External dependencies
 */
import classNames from 'classnames';
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { cartItems } from 'lib/cart-values';
import CompactCard from 'components/card/compact';
import config from 'config';
import Gridicon from 'components/gridicon';
import { getDaysUntilUserFacingExpiry, isInGracePeriod } from 'lib/plans';
import { isBusiness, isPremium } from 'lib/products-values';
import Notice from 'components/notice';
import PlanProgress from '../plan-progress';
import * as upgradesActions from 'lib/upgrades/actions';

const PlanStatus = React.createClass( {
	propTypes: {
		plan: React.PropTypes.object.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired
	},

	purchasePlan() {
		upgradesActions.addItem( cartItems.planItem( this.props.plan.productSlug ) );

		page( `/checkout/${ this.props.selectedSite.slug }` );
	},

	renderNotice() {
		const { plan } = this.props;

		if ( isInGracePeriod( plan ) ) {
			const daysAfterUserFacingExpiry = Math.abs( getDaysUntilUserFacingExpiry( plan ) );
			let noticeText;

			if ( daysAfterUserFacingExpiry === 0 ) {
				noticeText = this.translate( 'Expired today' );
			} else {
				noticeText = this.translate(
					'Expired %(days)d day ago',
					'Expired %(days)d days ago', {
						args: { days: daysAfterUserFacingExpiry },
						count: daysAfterUserFacingExpiry
					}
				);
			}

			return (
				<Notice isCompact status="is-error">
					{ noticeText }
				</Notice>
			);
		}
	},

	renderPurchaseButton() {
		if ( ! config.isEnabled( 'upgrades/checkout' ) ) {
			return null;
		}

		return (
			<Button
				className="plan-status__button"
				onClick={ this.purchasePlan }
				primary>
				{ this.translate( 'Purchase Now' ) }
			</Button>
		);
	},

	getPrices() {
		const { formattedPrice, rawDiscount, rawPrice } = this.props.plan,
			rawOriginalPrice = rawPrice + rawDiscount;

		return {
			original: formattedPrice.replace( rawPrice, rawOriginalPrice ),
			new: formattedPrice
		};
	},

	renderNudge() {
		const { rawDiscount: hasDiscount } = this.props.plan;

		if ( hasDiscount ) {
			const prices = this.getPrices();

			return (
				<div className="plan-status__nudge">
					{ this.translate(
						'{{del}}%(originalPrice)s{{/del}} {{strong}}%(newPrice)s{{/strong}} - Save when you combine your domain and plan',
						{
							args: {
								originalPrice: prices.original,
								newPrice: prices.new
							},
							components: {
								del: <del />,
								strong: <strong />
							},
							context: "Discount shown on the Plan Overview page"
						}
					) }
				</div>
			);
		}
	},

	render() {
		const { plan } = this.props,
			iconClasses = classNames( 'plan-status__icon', {
				'is-premium': isPremium( plan ),
				'is-business': isBusiness( plan ),
				'is-expired': isInGracePeriod( plan )
			} );

		return (
			<div className="plan-status">
				<CompactCard className="plan-status__info">
					<div className={ iconClasses }>
						{ isInGracePeriod( plan ) && <Gridicon icon="notice" /> }
					</div>

					<div className="plan-status__header">
						<span className="plan-status__text">
							{ this.translate( 'Your Current Plan:' ) }
						</span>

						<h1 className="plan-status__plan">
							{
								this.translate( '%(planName)s Free Trial', {
									args: { planName: plan.productName }
								} )
							}
						</h1>

						{ this.renderNudge() }

						{ this.renderNotice() }
					</div>

					{ this.renderPurchaseButton() }
				</CompactCard>

				{ ! isInGracePeriod( plan ) && <PlanProgress plan={ plan } /> }
			</div>
		);
	}
} );

export default PlanStatus;
