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
import { getName, isCancelable } from 'lib/purchases';
import { getPurchase, goToManagePurchase, isDataLoading, recordPageView } from '../utils';

const CancelPurchase = React.createClass( {
	propTypes: {
		selectedPurchase: React.PropTypes.object.isRequired,
		selectedSite: React.PropTypes.object
	},

	componentWillMount() {
		recordPageView( 'cancel_purchase', this.props );
	},

	componentWillReceiveProps( nextProps ) {
		recordPageView( 'cancel_purchase', this.props, nextProps );
	},

	componentDidMount() {
		this.ensurePageCanLoad();
	},

	componentDidUpdate() {
		this.ensurePageCanLoad();
	},

	render() {
		const purchase = getPurchase( this.props );

		if ( isDataLoading( this.props ) || ! purchase ) {
			return (
				<Main className="cancel-purchase">
					{ this.translate( 'Loading…' ) }
				</Main>
			);
		}

		return (
			<Main className="cancel-purchase">
				<HeaderCake onClick={ goToManagePurchase.bind( null, this.props ) }>
					{ this.translate( 'Cancel Purchase' ) }
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
						purchase={ purchase } />
				</CompactCard>
			</Main>
		);
	},

	ensurePageCanLoad() {
		if ( isDataLoading( this.props ) ) {
			return;
		}

		const purchase = getPurchase( this.props );

		if ( purchase ) {
			const { domain, id } = purchase;

			if ( ! isCancelable( purchase ) ) {
				page.redirect( paths.managePurchase( domain, id ) );
			}
		} else {
			page.redirect( paths.list() );
		}
	}
} );

export default CancelPurchase;
