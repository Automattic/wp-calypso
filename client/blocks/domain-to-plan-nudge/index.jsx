/**
 * External dependencies
 */
import debugFactory from 'debug';
import React, { PropTypes, Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { get } from 'lodash';

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

const debug = debugFactory( 'calypso:domain-to-plan-nudge' );

class DomainToPlanNudge extends Component {

	constructor() {
		super( ...arguments );
		this.oneClickUpgrade = this.oneClickUpgrade.bind( this );
		this.handleTransactionComplete = this.handleTransactionComplete.bind( this );
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

	handleTransactionComplete( error ) {
		//TODO: match expected analytics calls
		debug( 'transaction complete', error );
	}

	oneClickUpgrade() {
		const { siteId, storedCard } = this.props;
		const newPayment = storedCardPayment( storedCard );
		const transaction = {
			payment: newPayment
		};

		// set this to temporary so we don't clear the existing user cart on the server
		let cart = emptyCart( siteId, { temporary: true } );

		const personalCartItem = {
			free_trial: false,
			is_domain_registration: false,
			product_id: plansList[ PLAN_PERSONAL ].getProductId(),
			product_slug: PLAN_PERSONAL
		};
		cart = add( personalCartItem )( cart );

		debug( 'purchasing with', cart, transaction );

		submitTransaction( { cart, transaction }, this.handleTransactionComplete );
	}

	render() {
		if ( ! this.isVisible() ) {
			return null;
		}

		const { siteId, translate, storedCard } = this.props;
		return (
			<Card>
				<QueryStoredCards />
				<h3>{ translate( 'Upgrade to a Personal Plan and Save!' ) }</h3>
				<Button
					onClick={ this.oneClickUpgrade }
					disabled={ ! storedCard } >
					{ translate( 'One Click Checkout' ) }
				</Button>
				<Button href={ `/checkout/${ siteId }/personal` }>
					{ translate( 'Change CC' ) }
				</Button>
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
			siteId
		};
	},
	{
		recordTracksEvent
	}
)( localize( DomainToPlanNudge ) );
