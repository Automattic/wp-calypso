/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { get, forEach } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import { recordTracksEvent } from 'state/analytics/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSite, isCurrentSitePlan } from 'state/sites/selectors';
import { plansList, PLAN_FREE, PLAN_PERSONAL } from 'lib/plans/constants';
import storeTransactions from 'lib/store-transactions';
import upgradesActions from 'lib/upgrades/actions';
import { getStoredCards } from 'state/stored-cards/selectors';
import QueryStoredCards from 'components/data/query-stored-cards';
import TransactionStepsMixin from 'my-sites/upgrades/checkout/transaction-steps-mixin';
import { fillInAllCartItemAttributes } from 'lib/cart-values';
import { add, remove, getItemForPlan } from 'lib/cart-values/cart-items';
import { submitTransaction } from 'lib/upgrades/actions/checkout';

//use the redux store instead:
import productsListFactory from 'lib/products-list';
const productsList = productsListFactory();

const DomainToPlanNudge = React.createClass( {

	//verify if we need this mixin
	mixins: [ TransactionStepsMixin ],

	propTypes: {
		cart: PropTypes.object,       //from CheckoutData
		hasFreePlan: PropTypes.bool,
		site: PropTypes.object,
		siteId: PropTypes.number,
		translate: PropTypes.func,
		transaction: PropTypes.object //from CheckoutData
	},

	componentWillMount: function() {
		upgradesActions.resetTransaction();
	},

	isVisible() {
		const { site, hasFreePlan } = this.props;
		return site &&			//site exists
			site.wpcom_url &&   //has a mapped domain
			hasFreePlan;        //has a free wpcom plan
	},

	oneClickUpgrade() {
		//we might not need checkout data, since we use a fresh transaction
		//check free-trials.js for example
		const { storedCard, cart } = this.props;
		const newPayment = storeTransactions.storedCardPayment( storedCard );
		const transaction = {
			payment: newPayment
		};

		//clear cart (maybe use a temp cart instead via emptyCart ?)
		let newCart = cart;
		forEach( cart.products, ( item ) => {
			newCart = remove( item )( newCart );
		} );

		const personalCartItem = getItemForPlan( { product_slug: PLAN_PERSONAL } );
		newCart = add( personalCartItem )( newCart );

		newCart = fillInAllCartItemAttributes( newCart, productsList.get() );

		console.log( 'purchasing with', newCart, transaction );

		//fix analytics error
		submitTransaction( { cart, transaction }, ( error ) => {
			console.log( 'transaction done for', cart, transaction, error );
		} );
	},

	render() {
		if ( ! this.isVisible() ) {
			return null;
		}

		const { siteId, translate } = this.props;
		return (
			<Card>
				<QueryStoredCards />
				<h3>{ translate( 'Upgrade to a Personal Plan and Save!' ) }</h3>
				<Button
					onClick={ this.oneClickUpgrade }>
					{ translate( 'One Click Checkout' ) }
				</Button>
				<Button href={ `/checkout/${ siteId }/personal` }>
					{ translate( 'Change CC' ) }
				</Button>
			</Card>
		);
	}
} );

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
			siteId
		};
	},
	{
		recordTracksEvent
	}
)( localize( DomainToPlanNudge ) );
