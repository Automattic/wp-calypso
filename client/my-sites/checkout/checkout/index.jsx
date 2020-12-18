/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';
// eslint-disable-next-line no-restricted-imports

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { hasRenewalItem } from 'calypso/lib/cart-values/cart-items';
import { clearSitePlans } from 'calypso/state/sites/plans/actions';
import { clearPurchases } from 'calypso/state/purchases/actions';
import { fetchReceiptCompleted } from 'calypso/state/receipts/actions';
import QueryStoredCards from 'calypso/components/data/query-stored-cards';
import { getStoredCards, isFetchingStoredCards } from 'calypso/state/stored-cards/selectors';
import { recordViewCheckout } from 'calypso/lib/analytics/ad-tracking';
import { requestSite } from 'calypso/state/sites/actions';
import { isApplePayAvailable } from 'calypso/lib/web-payment';
import { loadTrackingTool } from 'calypso/state/analytics/actions';
import { withLocalizedMoment } from 'calypso/components/localized-moment';

/**
 * Style dependencies
 */
import './style.scss';

export class Checkout extends React.Component {
	static propTypes = {
		cards: PropTypes.array.isRequired,
		loadTrackingTool: PropTypes.func.isRequired,
	};

	componentDidMount() {
		if ( this.props.cart.hasLoadedFromServer ) {
			this.trackPageView();
		}

		this.props.loadTrackingTool( 'HotJar' );
		window.scrollTo( 0, 0 );
	}

	trackPageView( props ) {
		props = props || this.props;

		recordTracksEvent( 'calypso_checkout_page_view', {
			saved_cards: props.cards.length,
			is_renewal: hasRenewalItem( props.cart ),
			apple_pay_available: isApplePayAvailable(),
			product_slug: props.product,
		} );

		recordViewCheckout( props.cart );
	}

	render() {
		this.props.setHeaderText( '' );
		const children = React.Children.map( this.props.children, ( child ) => {
			return React.cloneElement( child, {
				cart: this.props.cart,
				cards: this.props.cards,
				isFetchingStoredCards: this.props.isFetchingStoredCards,
			} );
		} );

		return (
			<>
				<QueryStoredCards />
				{ children }
			</>
		);
	}
}

export default connect(
	( state ) => {
		return {
			cards: getStoredCards( state ),
			isFetchingStoredCards: isFetchingStoredCards( state ),
		};
	},
	{
		clearPurchases,
		clearSitePlans,
		fetchReceiptCompleted,
		requestSite,
		loadTrackingTool,
	}
)( localize( withLocalizedMoment( Checkout ) ) );
