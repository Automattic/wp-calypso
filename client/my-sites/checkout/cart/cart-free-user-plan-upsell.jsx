/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import formatCurrency from '@automattic/format-currency';
import { Button } from '@automattic/components';
import { getSelectedSite } from 'state/ui/selectors';
import { siteHasPaidPlan } from 'signup/steps/site-picker/site-picker-submit';
import { currentUserHasFlag, getCurrentUser } from 'state/current-user/selectors';
import { NON_PRIMARY_DOMAINS_TO_FREE_USERS } from 'state/current-user/constants';
import {
	hasDomainRegistration,
	hasTransferProduct,
	hasPlan,
	planItem,
} from 'lib/cart-values/cart-items';
import { addItem } from 'lib/cart/actions';
import SectionHeader from 'components/section-header';
import { PLAN_PERSONAL } from 'lib/plans/constants';
import { isRequestingSitePlans } from 'state/sites/plans/selectors';
import { isRequestingPlans } from 'state/plans/selectors';
import { getPlan } from 'lib/plans';
import { getPlanPrice } from 'state/products-list/selectors';
import TrackComponentView from 'lib/analytics/track-component-view';
import { recordTracksEvent } from 'state/analytics/actions';
import { getAllCartItems } from '../../../lib/cart-values/cart-items';
import { isDomainRegistration, isDomainTransfer } from '../../../lib/products-values';

class CartFreeUserPlanUpsell extends React.Component {
	static propTypes = {
		cart: PropTypes.object,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),
		hasPaidPlan: PropTypes.bool,
		hasPlanInCart: PropTypes.bool,
		isPlansListFetching: PropTypes.bool,
		isRegisteringOrTransferringDomain: PropTypes.bool,
		isSitePlansListFetching: PropTypes.bool,
		personalPlan: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),
		planPrice: PropTypes.oneOfType( [ PropTypes.number, PropTypes.bool ] ),
		showPlanUpsell: PropTypes.bool,
		translate: PropTypes.func.isRequired,
	};

	isLoading() {
		const { cart } = this.props;
		const isLoadingCart = ! cart.hasLoadedFromServer || cart.hasPendingServerUpdates;
		const isLoadingPlans = this.props.isPlansListFetching;
		const isLoadingSitePlans = this.props.isSitePlansListFetching;
		return isLoadingCart || isLoadingPlans || isLoadingSitePlans;
	}

	isRegistrationOrTransfer = ( item ) => {
		return isDomainRegistration( item ) || isDomainTransfer( item );
	};

	getUpgradeText() {
		const { cart, planPrice, translate } = this.props;
		const firstDomain = find( getAllCartItems( cart ), this.isRegistrationOrTransfer );

		if ( planPrice > firstDomain.cost ) {
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
		} else if ( planPrice < firstDomain.cost ) {
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
		const planCartItem = planItem( PLAN_PERSONAL, {} );
		this.props.addItemToCart( planCartItem );
		this.props.clickUpsellAddToCart();
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
	const personalPlan = getPlan( PLAN_PERSONAL );

	return {
		hasPaidPlan: siteHasPaidPlan( selectedSite ),
		hasPlanInCart: hasPlan( cart ),
		isPlansListFetching: isPlansListFetching,
		isRegisteringOrTransferringDomain: hasDomainRegistration( cart ) || hasTransferProduct( cart ),
		isSitePlansListFetching: isRequestingSitePlans( state ),
		personalPlan: personalPlan,
		planPrice:
			! isPlansListFetching &&
			selectedSiteId &&
			getPlanPrice( state, selectedSiteId, personalPlan, false ),
		selectedSite: selectedSite,
		showPlanUpsell: getCurrentUser( state )
			? selectedSiteId && currentUserHasFlag( state, NON_PRIMARY_DOMAINS_TO_FREE_USERS )
			: false,
		addItemToCart: addItemToCart || addItem,
	};
};

const mapDispatchToProps = ( dispatch ) => {
	return {
		clickUpsellAddToCart: () =>
			dispatch( recordTracksEvent( 'calypso_non_dwpo_checkout_plan_upsell_add_to_cart', {} ) ),
	};
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( CartFreeUserPlanUpsell ) );
