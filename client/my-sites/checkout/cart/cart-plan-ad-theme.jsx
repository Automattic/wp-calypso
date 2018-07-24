/** @format */

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
import config from 'config';
import CartAd from './cart-ad';
import { abtest } from 'lib/abtest';
import { cartItems } from 'lib/cart-values';
import { getSelectedSiteId } from 'state/ui/selectors';
import { addItem } from 'lib/upgrades/actions';
import { PLAN_PREMIUM, FEATURE_UNLIMITED_PREMIUM_THEMES } from 'lib/plans/constants';
import { hasFeature } from 'state/sites/plans/selectors';
import TrackComponentView from 'lib/analytics/track-component-view';
import { recordTracksEvent } from 'state/analytics/actions';

const eventName = 'cart_theme_to_plan_upsell';

class CartPlanAdTheme extends Component {
	addToCartAndRedirect = event => {
		event.preventDefault();
		addItem( cartItems.premiumPlan( PLAN_PREMIUM, {} ) );
		this.props.recordTracksEvent( 'calypso_banner_cta_click', {
			cta_name: eventName,
		} );
		page( '/checkout/' + this.props.selectedSite.slug );
	};

	shouldDisplayAd = () => {
		const { cart, hasUnlimitedPremiumThemes, selectedSite } = this.props;
		const items = cartItems.getAll( cart );
		const hasOnlyAPremiumTheme = items.length === 1 && items[ 0 ].product_slug === 'premium_theme';

		return (
			config.isEnabled( 'upsell/nudge-a-palooza' ) &&
			! hasUnlimitedPremiumThemes &&
			cart.hasLoadedFromServer &&
			! cart.hasPendingServerUpdates &&
			hasOnlyAPremiumTheme &&
			selectedSite &&
			selectedSite.plan &&
			abtest( 'nudgeAPalooza' ) === 'themesNudgesUpdates'
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
				Get this theme for FREE when you upgrade to a Premium plan!{' '}
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

const mapStateToProps = state => {
	const selectedSiteId = getSelectedSiteId( state );

	return {
		hasUnlimitedPremiumThemes: hasFeature(
			state,
			selectedSiteId,
			FEATURE_UNLIMITED_PREMIUM_THEMES
		),
	};
};

export default connect(
	mapStateToProps,
	{ recordTracksEvent }
)( localize( CartPlanAdTheme ) );
