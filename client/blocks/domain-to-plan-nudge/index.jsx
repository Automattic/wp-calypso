/**
 * External dependencies
 */
import debugFactory from 'debug';
import React, { PropTypes, Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { get } from 'lodash';
import page from 'page';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import { recordTracksEvent } from 'state/analytics/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSite, isCurrentSitePlan } from 'state/sites/selectors';
import { plansList, PLAN_FREE, PLAN_PERSONAL } from 'lib/plans/constants';
import { storedCardPayment } from 'lib/store-transactions';
import { getStoredCards } from 'state/stored-cards/selectors';
import QueryStoredCards from 'components/data/query-stored-cards';
import { emptyCart } from 'lib/cart-values';
import { add } from 'lib/cart-values/cart-items';
import { submitTransaction } from 'lib/upgrades/actions/checkout';
import PlanPrice from 'my-sites/plan-price';
import PlanIcon from 'components/plans/plan-icon';
import Gridicon from 'components/gridicon';
import { errorNotice, infoNotice, removeNotice } from 'state/notices/actions';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import {
	recordPurchase,
	recordOrderInAtlas,
	recordOrderInCriteo,
	recordConversionInOneByAOL
} from 'lib/analytics/ad-tracking';

const debug = debugFactory( 'calypso:domain-to-plan-nudge' );

class DomainToPlanNudge extends Component {

	constructor() {
		super( ...arguments );
		this.oneClickUpgrade = this.oneClickUpgrade.bind( this );
		this.handleTransactionComplete = this.handleTransactionComplete.bind( this );
		this.state = {
			isSubmitting: false,
			noticeId: null
		};
	}

	static propTypes = {
		hasFreePlan: PropTypes.bool,
		site: PropTypes.object,
		siteId: PropTypes.number,
		translate: PropTypes.func
	};

	isVisible() {
		const { site, hasFreePlan } = this.props;
		return site &&			//site exists
			site.wpcom_url &&   //has a mapped domain
			hasFreePlan;        //has a free wpcom plan
	}

	getCartItem() {
		return {
			free_trial: false,
			is_domain_registration: false,
			product_id: plansList[ PLAN_PERSONAL ].getProductId(),
			product_slug: PLAN_PERSONAL
		};
	}

	handleTransactionComplete( error, data ) {
		const { siteId, translate, userCurrency } = this.props;

		debug( 'transaction complete', error, data );
		// see transaction-steps-mixin for matching checkout analytics
		if ( error ) {
			if ( this.state.noticeId ) {
				this.props.removeNotice( this.state.noticeId );
			}
			const noticeAction = this.props.errorNotice(
				translate( 'There was a problem completing the purchase. Please try again.' )
			);
			this.setState( {
				isSubmitting: false,
				noticeId: get( noticeAction, 'notice.noticeId' )
			} );
			this.props.recordTracksEvent(
				'calypso_checkout_payment_error',
				{ reason: error.message }
			);
			return;
		}
		const receiptId = data.receipt_id;

		// ad tracking
		const product = { ...this.getCartItem(), currency: userCurrency, cost: 35.88, volume: 1 }; //TODO: pass through price
		const cart = { products: [ product ], total_cost: 35.88, currency: userCurrency };
		recordPurchase( product, receiptId );
		recordOrderInAtlas( cart, receiptId );
		recordOrderInCriteo( cart, receiptId );
		recordConversionInOneByAOL();

		// tracks
		this.props.recordTracksEvent( 'calypso_checkout_payment_success', {
			coupon_code: '',
			currency: userCurrency,
			payment_method: storedCardPayment().paymentMethod,
			total_cost: 35.88 //TODO: pass through discounted plan price here
		} );

		this.props.recordTracksEvent( 'calypso_checkout_product_purchase', this.getCartItem() );

		// redirect to thank you
		page( `/checkout/thank-you/${ siteId }/${ receiptId }` );
	}

	oneClickUpgrade() {
		const { siteId, storedCard, translate } = this.props;
		const newPayment = storedCardPayment( storedCard );
		const transaction = {
			payment: newPayment
		};

		// set this to temporary so we don't clear the existing user cart on the server
		let cart = emptyCart( siteId, { temporary: true } );

		const personalCartItem = this.getCartItem();
		cart = add( personalCartItem )( cart );

		debug( 'purchasing with', cart, transaction );

		if ( this.state.noticeId ) {
			this.props.removeNotice( this.state.noticeId );
		}
		const noticeAction = this.props.infoNotice( translate( 'Submitting payment' ) );
		this.setState( {
			isSubmitting: true,
			noticeId: get( noticeAction, 'notice.noticeId' )
		} );

		submitTransaction( { cart, transaction }, this.handleTransactionComplete );
	}

	render() {
		if ( ! this.isVisible() ) {
			return null;
		}

		const { isSubmitting } = this.state;
		const { translate, storedCard } = this.props;

		return (
			<Card className="domain-to-plan-nudge">
				<QueryStoredCards />

				<div className="domain-to-plan-nudge__header">
					<div className="domain-to-plan-nudge__header-icon">
						<PlanIcon plan="personal-bundle" />
					</div>
					<div className="domain-to-plan-nudge__header-copy">
						<h3 className="domain-to-plan-nudge__header-title">
							{ translate( 'Upgrade to a Personal Plan and Save!' ) }
						</h3>
						<ul className="domain-to-plan-nudge__header-features">
							<li>
								<div className="domain-to-plan-nudge__header-features-item">
									<Gridicon
										className="domain-to-plan-nudge__header-features-item-checkmark"
										icon="checkmark"
										size="22"
									/>
									{ translate( 'Remove all WordPress.com advertising from your website' ) }
								</div>
							</li>
							<li>
								<div className="domain-to-plan-nudge__header-features-item">
									<Gridicon
										className="domain-to-plan-nudge__header-features-item-checkmark"
										icon="checkmark"
										size="22"
									/>
									{ translate( 'Get high quality live chat and priority email support' ) }
								</div>
							</li>
							<li>
								<div className="domain-to-plan-nudge__header-features-item">
									<Gridicon
										className="domain-to-plan-nudge__header-features-item-checkmark"
										icon="checkmark"
										size="22"
									/>
									{ translate( 'Upload up to 3GB of photos and videos' ) }
								</div>
							</li>
							<li>
								<div className="domain-to-plan-nudge__header-features-item">
									<Gridicon
										className="domain-to-plan-nudge__header-features-item-checkmark"
										icon="checkmark"
										size="22"
									/>
									{ translate( 'Bundled with your domain for the best value!' ) }
								</div>
							</li>
						</ul>
					</div>
				</div>
				<div className="domain-to-plan-nudge__actions-group">
					<div className="domain-to-plan-nudge__plan-price-group">
						<div className="domain-to-plan-nudge__discount-percentage">
							Save 25%
						</div>
						<PlanPrice rawPrice="35.88" original />
						<PlanPrice rawPrice="29.88" discounted />
						<div className="domain-to-plan-nudge__plan-price-timeframe">
							{ translate( 'for one year subscription' ) }
						</div>
					</div>
					<div className="domain-to-plan-nudge__upgrade-group">
						<Button
							onClick={ this.oneClickUpgrade }
							disabled={ ! storedCard || isSubmitting }
							primary
						>
							{
								isSubmitting ? translate( 'Completing your purchase' ) : translate( 'Upgrade Now for xx.xx' )
							}
						</Button>
						<div className="domain-to-plan-nudge__credit-card-info">
							{ translate( 'Using credit card ****%s', { args: storedCard ? storedCard.card : 'xxxx' } ) }
						</div>
					</div>
				</div>
			</Card>
		);
	}
}

export default connect(
	( state, props ) => {
		const siteId = props.siteId || getSelectedSiteId( state );
		return {
			hasFreePlan: isCurrentSitePlan(
				state,
				siteId,
				plansList[ PLAN_FREE ].getProductId()
			),
			storedCard: get( getStoredCards( state ), '0' ),
			site: getSite( state, siteId ),
			siteId,
			userCurrency: getCurrentUserCurrencyCode( state ) //populated by either plans endpoint
		};
	},
	{
		infoNotice,
		errorNotice,
		recordTracksEvent,
		removeNotice
	}
)( localize( DomainToPlanNudge ) );
