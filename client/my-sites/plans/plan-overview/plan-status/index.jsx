/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import page from 'page';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { cartItems } from 'lib/cart-values';
import CompactCard from 'components/card/compact';
import Gridicon from 'components/gridicon';
import { getDaysUntilUserFacingExpiry, isInGracePeriod } from 'lib/plans';
import Notice from 'components/notice';
import PlanProgress from '../plan-progress';
import { isPremium, isBusiness } from 'lib/products-values';
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

	render() {
		const { plan } = this.props,
			iconClasses = classNames( 'plan-status__icon', {
				'is-premium': isPremium( plan ),
				'is-business': isBusiness( plan )
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
						{ this.renderNotice() }
					</div>

					<Button
						className="plan-status__button"
						onClick={ this.purchasePlan }
						primary>
						{ this.translate( 'Purchase Now' ) }
					</Button>
				</CompactCard>

				{ ! isInGracePeriod( plan ) && <PlanProgress plan={ plan } /> }
			</div>
		);
	}
} );

export default PlanStatus;
