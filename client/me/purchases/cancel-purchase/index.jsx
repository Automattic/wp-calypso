/**
 * External Dependencies
 */
import page from 'page';
import React from 'react';

/**
 * Internal Dependencies
 */
import Card from 'components/card';
import CancelPurchaseButton from './button';
import CancelPurchaseRefundInformation from './refund-information';
import CompactCard from 'components/card/compact';
import { getName, isCancelable, isOneTimePurchase, isRefundable, isSubscription } from 'lib/purchases';
import { getPurchase, getSelectedSite, goToManagePurchase, recordPageView } from 'me/purchases/utils';
import HeaderCake from 'components/header-cake';
import { isDomainRegistration } from 'lib/products-values';
import Main from 'components/main';
import paths from '../paths';
import ProductLink from 'me/purchases/product-link';
import support from 'lib/url/support';
import titles from 'me/purchases/titles';

const CancelPurchase = React.createClass( {
	propTypes: {
		selectedPurchase: React.PropTypes.object.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.bool,
			React.PropTypes.object
		] )
	},

	componentWillMount() {
		if ( ! this.isDataValid() ) {
			this.redirect( this.props );
			return;
		}

		recordPageView( 'cancel_purchase', this.props );
	},

	componentWillReceiveProps( nextProps ) {
		if ( this.isDataValid() && ! this.isDataValid( nextProps ) ) {
			this.redirect( nextProps );
			return;
		}

		recordPageView( 'cancel_purchase', this.props, nextProps );
	},

	isDataValid( props = this.props ) {
		const purchase = getPurchase( props ),
			selectedSite = getSelectedSite( props );

		return ( selectedSite && purchase && isCancelable( purchase ) );
	},

	redirect( props ) {
		const purchase = getPurchase( props ),
			selectedSite = getSelectedSite( props );
		let redirectPath = paths.list();

		if ( selectedSite && purchase && ! isCancelable( purchase ) ) {
			redirectPath = paths.managePurchase( selectedSite.slug, purchase.id );
		}

		page.redirect( redirectPath );
	},

	renderFooterText() {
		const purchase = getPurchase( this.props ),
			{ refundText, renewDate } = purchase;

		if ( isRefundable( purchase ) ) {
			return this.translate( '%(refundText)s to be refunded', {
				args: { refundText },
				context: 'refundText is of the form "[currency-symbol][amount]" i.e. "$20"'
			} );
		}

		const renewalDate = this.moment( renewDate ).format( 'LL' );

		if ( isDomainRegistration( purchase ) ) {
			return this.translate( 'Domain will be removed on %(renewalDate)s', {
				args: { renewalDate }
			} );
		}

		return this.translate( 'Subscription will be removed on %(renewalDate)s', {
			args: { renewalDate }
		} );
	},

	render() {
		if ( ! this.isDataValid() ) {
			return null;
		}

		const purchase = getPurchase( this.props ),
			purchaseName = getName( purchase ),
			{ siteName, domain: siteDomain } = purchase;

		let heading;

		if ( isDomainRegistration( purchase ) || isOneTimePurchase( purchase ) ) {
			heading = this.translate( 'Cancel %(purchaseName)s', {
				args: { purchaseName }
			} );
		}

		if ( isSubscription( purchase ) ) {
			heading = this.translate( 'Cancel Your %(purchaseName)s Subscription', {
				args: { purchaseName }
			} );
		}

		return (
			<Main className="cancel-purchase">
				<HeaderCake onClick={ goToManagePurchase.bind( null, this.props ) }>
					{ titles.cancelPurchase }
				</HeaderCake>

				<Card className="cancel-purchase__card">
					<h2>
						{ heading }
					</h2>

					<div className="cancel-purchase__info">
						<CancelPurchaseRefundInformation purchase={ purchase } />

						<strong className="cancel-purchase__support-information">
							{ this.translate( 'Have a question? {{contactLink}}Ask a Happiness Engineer!{{/contactLink}}', {
								components: {
									contactLink: <a href={ support.CALYPSO_CONTACT } />
								}
							} ) }
						</strong>
					</div>
				</Card>

				<CompactCard className="cancel-purchase__product-information">
					<div className="cancel-purchase__purchase-name">{ purchaseName }</div>
					<div className="cancel-purchase__site-title">{ siteName || siteDomain }</div>
					<ProductLink
						selectedPurchase={ purchase }
						selectedSite={ this.props.selectedSite } />
				</CompactCard>
				<CompactCard className="cancel-purchase__footer">
					<div className="cancel-purchase__refund-amount">
						{ this.renderFooterText( this.props ) }
					</div>
					<CancelPurchaseButton
						purchase={ purchase }
						selectedSite={ this.props.selectedSite } />
				</CompactCard>
			</Main>
		);
	}
} );

export default CancelPurchase;
