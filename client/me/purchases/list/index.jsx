/**
 * External Dependencies
 */
import { connect } from 'react-redux';
import React from 'react';

/**
 * Internal Dependencies
 */
import CompactCard from 'components/card';
import EmptyContent from 'components/empty-content';
import { getUserPurchases, hasLoadedUserPurchasesFromServer, isFetchingUserPurchases } from 'state/purchases/selectors';
import { getPurchasesBySite } from 'lib/purchases';
import Main from 'components/main';
import MeSidebarNavigation from 'me/sidebar-navigation';
import PurchasesHeader from './header';
import PurchasesSite from './site';
import QueryUserPurchases from 'components/data/query-user-purchases';
import userFactory from 'lib/user';
const user = userFactory();

const PurchasesList = React.createClass( {
	propTypes: {
		noticeType: React.PropTypes.string,
		purchases: React.PropTypes.oneOfType( [
			React.PropTypes.array,
			React.PropTypes.bool
		] ),
		sites: React.PropTypes.object.isRequired
	},

	isDataLoading() {
		if ( this.props.isFetchingUserPurchases && ! this.props.hasLoadedUserPurchasesFromServer ) {
			return true;
		}

		return ! this.props.sites.initialized;
	},

	render() {
		let content;

		if ( this.isDataLoading() ) {
			content = <PurchasesSite isPlaceholder />;
		}

		if ( this.props.hasLoadedUserPurchasesFromServer && this.props.purchases.length ) {
			content = getPurchasesBySite( this.props.purchases, this.props.sites.get() ).map(
				site => (
					<PurchasesSite
						key={ site.id }
						name={ site.title }
						slug={ site.slug }
						purchases={ site.purchases } />
				)
			);
		}

		if ( this.props.hasLoadedUserPurchasesFromServer && ! this.props.purchases.length ) {
			content = (
				<CompactCard className="purchases-list__no-content">
					<EmptyContent
						title={ this.translate( 'Looking to upgrade?' ) }
						line={ this.translate( 'Our plans give your site the power to thrive. ' +
								'Find the plan that works for you.' ) }
						action={ this.translate( 'Upgrade Now' ) }
						actionURL={ '/plans' }
						illustration={ '/calypso/images/drake/drake-whoops.svg' }
						isCompact />
				</CompactCard>
			);
		}

		return (
			<span>
				<Main className="purchases-list">
					<MeSidebarNavigation />
					<PurchasesHeader section={ 'purchases' } />
					<QueryUserPurchases userId={ user.get().ID } />
					{ content }
				</Main>
			</span>
		);
	}
} );

export default connect(
	state => ( {
		purchases: getUserPurchases( state, user.get().ID ),
		hasLoadedUserPurchasesFromServer: hasLoadedUserPurchasesFromServer( state ),
		isFetchingUserPurchases: isFetchingUserPurchases( state )
	} ),
	undefined
)( PurchasesList );
