/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import CartAd from './cart-ad';
import { abtest } from 'lib/abtest';
import { premiumPlan, getAllCartItems } from 'lib/cart-values/cart-items';
import { getSelectedSiteId } from 'state/ui/selectors';
import { addItem } from 'lib/cart/actions';
import { PLAN_PREMIUM, FEATURE_UNLIMITED_PREMIUM_THEMES } from 'lib/plans/constants';
import { hasFeature } from 'state/sites/plans/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import TrackComponentView from 'lib/analytics/track-component-view';
import { recordTracksEvent } from 'state/analytics/actions';

const eventName = 'cart_theme_to_plan_upsell';

class CartPlanAdTheme extends Component {
	addToCartAndRedirect = ( event ) => {
		event.preventDefault();
		this.props.recordTracksEvent( 'calypso_banner_cta_click', {
			cta_name: eventName,
		} );
		addItem( premiumPlan( PLAN_PREMIUM, {} ) );
		page( '/checkout/' + this.props.selectedSite.slug );
	};

	shouldDisplayAd = () => {
		const { cart, hasUnlimitedPremiumThemes, selectedSite, isJetpack } = this.props;
		const items = getAllCartItems( cart );
		const hasOnlyAPremiumTheme = items.length === 1 && items[ 0 ].product_slug === 'premium_theme';

		return (
			! isJetpack &&
			! hasUnlimitedPremiumThemes &&
			cart.hasLoadedFromServer &&
			! cart.hasPendingServerUpdates &&
			hasOnlyAPremiumTheme &&
			selectedSite &&
			selectedSite.plan &&
			abtest( 'cartNudgeUpdateToPremium' ) === 'test'
		);
	};

	render() {
		// Nothing here is translated on purpose - this is a part of an A/B test that we are launching
		// only for english audience. Remember to add translate() calls before concluding a test and
		// enabling this for everyone!
		if ( ! this.shouldDisplayAd() ) {
			return null;
		}

		const className = 'button is-link';

		return (
			<CartAd>
				<TrackComponentView
					eventName={ 'calypso_banner_cta_impression' }
					eventProperties={ {
						cta_name: eventName,
					} }
				/>
				Get this theme for FREE when you upgrade to a Premium plan!{ ' ' }
				<button className={ className } onClick={ this.addToCartAndRedirect }>
					{ 'Upgrade Now' }
				</button>
			</CartAd>
		);
	}
}

CartPlanAdTheme.propTypes = {
	cart: PropTypes.object.isRequired,
	hasUnlimitedPremiumThemes: PropTypes.bool,
	selectedSite: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.object ] ),
};

const mapStateToProps = ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );

	return {
		isJetpack: isJetpackSite( state, selectedSiteId ),
		hasUnlimitedPremiumThemes: hasFeature(
			state,
			selectedSiteId,
			FEATURE_UNLIMITED_PREMIUM_THEMES
		),
	};
};

export default connect( mapStateToProps, { recordTracksEvent } )( localize( CartPlanAdTheme ) );
