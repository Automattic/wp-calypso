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
import CancelPurchaseProductInformation from './product-information';
import CancelPurchaseRefundInformation from './refund-information';
import CancelPurchaseSupportBox from './support-box';
import CompactCard from 'components/card/compact';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import paths from '../paths';
import titles from 'me/purchases/titles';
import { getName, isCancelable } from 'lib/purchases';
import { getPurchase, getSelectedSite, goToManagePurchase, recordPageView } from 'me/purchases/utils';

const CancelPurchase = React.createClass( {
	propTypes: {
		selectedPurchase: React.PropTypes.object.isRequired,
		selectedSite: React.PropTypes.object.isRequired
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

	render() {
		if ( ! this.isDataValid() ) {
			return null;
		}

		const purchase = getPurchase( this.props );

		return (
			<Main className="cancel-purchase">
				<HeaderCake onClick={ goToManagePurchase.bind( null, this.props ) }>
					{ titles.cancelPurchase }
				</HeaderCake>

				<Card className="cancel-purchase__card">
					<h2>
						{ this.translate( 'Cancel %(purchaseName)s', {
							args: {
								purchaseName: getName( purchase )
							}
						} ) }
					</h2>

					<div className="cancel-purchase__info">
						<CancelPurchaseSupportBox purchase={ purchase } />

						<div className="cancel-purchase__content">
							<div className="cancel-purchase__section">
								<strong className="cancel-purchase__section-header">{ this.translate( 'What am I canceling?' ) }</strong>

								<CancelPurchaseProductInformation
									purchase={ purchase }
									selectedSite={ this.props.selectedSite } />
							</div>

							<hr />

							<div className="cancel-purchase__section">
								<strong className="cancel-purchase__section-header">{ this.translate( 'Do I get a refund?' ) }</strong>

								<CancelPurchaseRefundInformation
									purchase={ purchase } />
							</div>
						</div>
					</div>
				</Card>

				<CompactCard className="cancel-purchase__footer">
					<CancelPurchaseButton
						purchase={ purchase }
						selectedSite={ this.props.selectedSite } />
				</CompactCard>
			</Main>
		);
	}
} );

export default CancelPurchase;
