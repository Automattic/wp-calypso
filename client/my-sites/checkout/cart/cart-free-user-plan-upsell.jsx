import {
	getPlan,
	PLAN_PERSONAL,
	isDomainRegistration,
	isDomainTransfer,
	PLAN_WPCOM_PRO,
} from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import SectionHeader from 'calypso/components/section-header';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import {
	hasDomainRegistration,
	hasTransferProduct,
	hasPlan,
	planItem,
} from 'calypso/lib/cart-values/cart-items';
import { isEligibleForProPlan } from 'calypso/my-sites/plans-comparison';
import { siteHasPaidPlan } from 'calypso/signup/steps/site-picker/site-picker-submit';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isRequestingPlans } from 'calypso/state/plans/selectors';
import { getPlanPrice } from 'calypso/state/products-list/selectors';
import { isRequestingSitePlans } from 'calypso/state/sites/plans/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { getAllCartItems } from '../../../lib/cart-values/cart-items';

class CartFreeUserPlanUpsell extends Component {
	static propTypes = {
		cart: PropTypes.object,
		isCartPendingUpdate: PropTypes.bool,
		addItemToCart: PropTypes.func.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),
		hasPaidPlan: PropTypes.bool,
		hasPlanInCart: PropTypes.bool,
		isPlansListFetching: PropTypes.bool,
		isRegisteringOrTransferringDomain: PropTypes.bool,
		isSitePlansListFetching: PropTypes.bool,
		upsellPlan: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),
		planPrice: PropTypes.oneOfType( [ PropTypes.number, PropTypes.bool ] ),
		showPlanUpsell: PropTypes.bool,
		translate: PropTypes.func.isRequired,
	};

	isLoading() {
		const { isCartPendingUpdate: isLoadingCart } = this.props;
		const isLoadingPlans = this.props.isPlansListFetching;
		const isLoadingSitePlans = this.props.isSitePlansListFetching;
		return isLoadingCart || isLoadingPlans || isLoadingSitePlans;
	}

	isRegistrationOrTransfer = ( item ) => {
		return isDomainRegistration( item ) || isDomainTransfer( item );
	};

	getUpgradeText() {
		const { cart, planPrice, translate, eligibleForProPlan } = this.props;
		const firstDomain = getAllCartItems( cart ).find( this.isRegistrationOrTransfer );

		if ( planPrice > firstDomain.cost ) {
			const extraToPay = planPrice - firstDomain.cost;
			return eligibleForProPlan
				? translate(
						'Pay an {{strong}}extra %(extraToPay)s{{/strong}} for our Pro plan, and get access to all its ' +
							'features, plus the first year of your domain for free.',
						{
							args: {
								extraToPay: formatCurrency( extraToPay, firstDomain.currency ),
							},
							components: {
								strong: <strong />,
							},
						}
				  )
				: translate(
						'Pay an {{strong}}extra %(extraToPay)s{{/strong}} for our Personal plan, and get access to all its ' +
							'features, plus the first year of your domain for free.',
						{
							args: {
								extraToPay: formatCurrency( extraToPay, firstDomain.currency ),
							},
							components: {
								strong: <strong />,
							},
						}
				  );
		} else if ( planPrice < firstDomain.cost ) {
			const savings = firstDomain.cost - planPrice;
			return eligibleForProPlan
				? translate(
						'{{strong}}Save %(savings)s{{/strong}} when you purchase a WordPress.com Pro plan ' +
							'instead — your domain comes free for a year.',
						{
							args: {
								savings: formatCurrency( savings, firstDomain.currency ),
							},
							components: {
								strong: <strong />,
							},
						}
				  )
				: translate(
						'{{strong}}Save %(savings)s{{/strong}} when you purchase a WordPress.com Personal plan ' +
							'instead — your domain comes free for a year.',
						{
							args: {
								savings: formatCurrency( savings, firstDomain.currency ),
							},
							components: {
								strong: <strong />,
							},
						}
				  );
		}

		return eligibleForProPlan
			? translate(
					'Purchase our Pro plan at {{strong}}no extra cost{{/strong}}, and get access to all its ' +
						'features, plus the first year of your domain for free.',
					{
						components: {
							strong: <strong />,
						},
					}
			  )
			: translate(
					'Purchase our Personal plan at {{strong}}no extra cost{{/strong}}, and get access to all its ' +
						'features, plus the first year of your domain for free.',
					{
						components: {
							strong: <strong />,
						},
					}
			  );
	}

	shouldRender() {
		if ( this.isLoading() ) {
			return false;
		}

		const {
			hasPaidPlan,
			hasPlanInCart,
			isRegisteringOrTransferringDomain,
			selectedSite,
			showPlanUpsell,
		} = this.props;

		return (
			isRegisteringOrTransferringDomain &&
			showPlanUpsell &&
			selectedSite &&
			! hasPaidPlan &&
			! hasPlanInCart
		);
	}

	addPlanToCart = () => {
		const { eligibleForProPlan } = this.props;
		const planCartItem = eligibleForProPlan
			? planItem( PLAN_WPCOM_PRO )
			: planItem( PLAN_PERSONAL );

		if ( planCartItem ) {
			this.props.addItemToCart( planCartItem );
			this.props.clickUpsellAddToCart();
		}
	};

	render() {
		if ( ! this.shouldRender() ) {
			return null;
		}

		const { translate } = this.props;

		return (
			<div className="cart__upsell-wrapper">
				<SectionHeader
					className="cart__header cart__upsell-header"
					label={ translate( 'Upgrade and save' ) }
				/>
				<div className="cart__upsell-body">
					<p>{ this.getUpgradeText() }</p>
					<Button onClick={ this.addPlanToCart }>{ translate( 'Add to Cart' ) }</Button>
				</div>
				<TrackComponentView eventName="calypso_non_dwpo_checkout_plan_upsell_impression" />
			</div>
		);
	}
}

const mapStateToProps = ( state, { cart, addItemToCart } ) => {
	const selectedSite = getSelectedSite( state );
	const selectedSiteId = selectedSite ? selectedSite.ID : null;
	const isPlansListFetching = isRequestingPlans( state );
	const eligibleForProPlan = isEligibleForProPlan( state, selectedSiteId );
	const upsellPlan = eligibleForProPlan ? getPlan( PLAN_WPCOM_PRO ) : getPlan( PLAN_PERSONAL );

	return {
		hasPaidPlan: siteHasPaidPlan( selectedSite ),
		hasPlanInCart: hasPlan( cart ),
		isPlansListFetching,
		isRegisteringOrTransferringDomain: hasDomainRegistration( cart ) || hasTransferProduct( cart ),
		isSitePlansListFetching: isRequestingSitePlans( state ),
		upsellPlan,
		planPrice:
			! isPlansListFetching &&
			selectedSiteId &&
			getPlanPrice( state, selectedSiteId, upsellPlan, false ),
		selectedSite,
		showPlanUpsell: !! selectedSiteId,
		addItemToCart,
		eligibleForProPlan,
	};
};

const mapDispatchToProps = ( dispatch ) => {
	return {
		clickUpsellAddToCart: () =>
			dispatch( recordTracksEvent( 'calypso_non_dwpo_checkout_plan_upsell_add_to_cart', {} ) ),
	};
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( CartFreeUserPlanUpsell ) );
