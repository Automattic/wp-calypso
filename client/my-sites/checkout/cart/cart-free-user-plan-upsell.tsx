import {
	getPlan,
	PLAN_PERSONAL,
	isDomainRegistration,
	isDomainTransfer,
} from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { localize, useTranslate } from 'i18n-calypso';
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
import { siteHasPaidPlan } from 'calypso/signup/steps/site-picker/site-picker-submit';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isRequestingPlans } from 'calypso/state/plans/selectors';
import { getPlanPrice } from 'calypso/state/products-list/selectors';
import { isRequestingSitePlans } from 'calypso/state/sites/plans/selectors';
import { CalypsoDispatch } from 'calypso/state/types';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { SiteDetails } from '@automattic/data-stores';
import type {
	ResponseCart,
	MinimalRequestCartProduct,
	ResponseCartProduct,
} from '@automattic/shopping-cart';
import type { AppState } from 'calypso/types';

export interface CartFreeUserPlanUpsellProps {
	cart: Pick< ResponseCart, 'products' >;
	isCartPendingUpdate?: boolean;
	addItemToCart: ( item: MinimalRequestCartProduct ) => void;
}

interface CartFreeUserPlanUpsellHocProps {
	selectedSite?: SiteDetails | null;
	hasPaidPlan?: boolean;
	hasPlanInCart?: boolean;
	isPlansListFetching?: boolean;
	isRegisteringOrTransferringDomain?: boolean;
	isSitePlansListFetching?: boolean;
	planPrice: number | false | null | undefined;
	showPlanUpsell?: boolean;
	translate: ReturnType< typeof useTranslate >;
	clickUpsellAddToCart: () => void;
}

class CartFreeUserPlanUpsell extends Component<
	CartFreeUserPlanUpsellProps & CartFreeUserPlanUpsellHocProps
> {
	isLoading() {
		const { isCartPendingUpdate: isLoadingCart } = this.props;
		const isLoadingPlans = this.props.isPlansListFetching;
		const isLoadingSitePlans = this.props.isSitePlansListFetching;
		return isLoadingCart || isLoadingPlans || isLoadingSitePlans;
	}

	isRegistrationOrTransfer = ( item: ResponseCartProduct ) => {
		return isDomainRegistration( item ) || isDomainTransfer( item );
	};

	getUpgradeText() {
		const { cart, planPrice, translate } = this.props;
		const firstDomain = cart.products.find( this.isRegistrationOrTransfer );

		if ( planPrice && firstDomain && planPrice > firstDomain.cost ) {
			const extraToPay = planPrice - firstDomain.cost;
			return translate(
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
		} else if ( planPrice && firstDomain && planPrice < firstDomain.cost ) {
			const savings = firstDomain.cost - planPrice;
			return translate(
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

		return translate(
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
		const planCartItem = planItem( PLAN_PERSONAL );

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

const mapStateToProps = ( state: AppState, { cart }: CartFreeUserPlanUpsellProps ) => {
	const selectedSite = getSelectedSite( state );
	const selectedSiteId = selectedSite ? selectedSite.ID : null;
	const isPlansListFetching = isRequestingPlans( state );
	const upsellPlan = getPlan( PLAN_PERSONAL );

	return {
		hasPaidPlan: siteHasPaidPlan( selectedSite ),
		hasPlanInCart: hasPlan( cart ),
		isPlansListFetching,
		isRegisteringOrTransferringDomain: hasDomainRegistration( cart ) || hasTransferProduct( cart ),
		isSitePlansListFetching: isRequestingSitePlans( state ),
		planPrice:
			! isPlansListFetching &&
			selectedSiteId &&
			upsellPlan &&
			getPlanPrice( state, selectedSiteId, upsellPlan, false ),
		selectedSite,
		showPlanUpsell: !! selectedSiteId,
	};
};

const mapDispatchToProps = ( dispatch: CalypsoDispatch ) => {
	return {
		clickUpsellAddToCart: () =>
			dispatch( recordTracksEvent( 'calypso_non_dwpo_checkout_plan_upsell_add_to_cart', {} ) ),
	};
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( CartFreeUserPlanUpsell ) );
