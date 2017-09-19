import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * External Dependencies
 */
import PropTypes from 'prop-types';

import React, { Component } from 'react';

/**
 * Internal Dependencies
 */
import CompactCard from 'components/card';
import EmptyContent from 'components/empty-content';
import {
	getUserPurchases,
	hasLoadedUserPurchasesFromServer,
	isFetchingUserPurchases,
} from 'state/purchases/selectors';
import { getSites } from 'state/selectors';
import { getPurchasesBySite } from 'lib/purchases';
import Main from 'components/main';
import MeSidebarNavigation from 'me/sidebar-navigation';
import PurchasesHeader from './header';
import PurchasesSite from '../purchases-site';
import QueryUserPurchases from 'components/data/query-user-purchases';
import userFactory from 'lib/user';
const user = userFactory();

class PurchasesList extends Component {
	isDataLoading() {
		if ( this.props.isFetchingUserPurchases && ! this.props.hasLoadedUserPurchasesFromServer ) {
			return true;
		}

		return ! this.props.sites.length;
	}

	render() {
		let content;

		if ( this.isDataLoading() ) {
			content = <PurchasesSite isPlaceholder />;
		}

		if ( this.props.hasLoadedUserPurchasesFromServer && this.props.purchases.length ) {
			content = getPurchasesBySite( this.props.purchases, this.props.sites ).map(
				site => (
					<PurchasesSite
						key={ site.id }
						siteId={ site.id }
						name={ site.name }
						domain={ site.domain }
						slug={ site.slug }
						purchases={ site.purchases }
					/>
				)
			);
		}

		if ( this.props.hasLoadedUserPurchasesFromServer && ! this.props.purchases.length ) {
			content = (
				<CompactCard className="purchases-list__no-content">
					<EmptyContent
						title={ this.props.translate( 'Looking to upgrade?' ) }
						line={ this.props.translate(
							'Our plans give your site the power to thrive. ' +
								'Find the plan that works for you.'
						) }
						action={ this.props.translate( 'Upgrade Now' ) }
						actionURL={ '/plans' }
						illustration={ '/calypso/images/illustrations/illustration-nosites.svg' }
					/>
				</CompactCard>
			);
		}

		return (
			<Main className="purchases-list">
				<MeSidebarNavigation />
				<PurchasesHeader section={ 'purchases' } />
				<QueryUserPurchases userId={ user.get().ID } />
				{ content }
			</Main>
		);
	}
}

PurchasesList.propTypes = {
	noticeType: PropTypes.string,
	purchases: PropTypes.oneOfType( [ PropTypes.array, PropTypes.bool ] ),
	sites: PropTypes.array.isRequired,
};

export default connect(
	state => ( {
		purchases: getUserPurchases( state, user.get().ID ),
		hasLoadedUserPurchasesFromServer: hasLoadedUserPurchasesFromServer( state ),
		isFetchingUserPurchases: isFetchingUserPurchases( state ),
		sites: getSites( state ),
	} ),
	undefined
)( localize( PurchasesList ) );
