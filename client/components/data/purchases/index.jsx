/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { fetchUserPurchases } from 'lib/upgrades/actions';
import observe from 'lib/mixins/data-observe';
import PurchasesStore from 'lib/purchases/store';
import { shouldFetchPurchases } from 'lib/purchases';
import StoreConnection from 'components/data/store-connection';
import userFactory from 'lib/user';

/**
 * Module variables
 */
const user = userFactory(),
	stores = [ PurchasesStore, user ];

function getStateFromStores( props ) {
	return {
		noticeType: props.noticeType,
		purchases: PurchasesStore.getByUser( user.get().ID ),
		sites: props.sites
	};
}

const PurchasesData = React.createClass( {
	propTypes: {
		component: React.PropTypes.func.isRequired,
		noticeType: React.PropTypes.string,
		sites: React.PropTypes.object.isRequired
	},

	mixins: [ observe( 'sites' ) ],

	componentDidMount() {
		if ( shouldFetchPurchases( PurchasesStore.get() ) ) {
			fetchUserPurchases( user.get().ID );
		}
	},

	render() {
		return (
			<StoreConnection
				component={ this.props.component }
				noticeType={ this.props.noticeType }
				sites={ this.props.sites }
				stores={ stores }
				getStateFromStores={ getStateFromStores } />
		);
	}
} );

export default PurchasesData;
