/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import MeSidebarNavigation from 'me/sidebar-navigation';
import PurchasesHeader from '../purchases/purchases-list/header';
import Main from 'components/main';
import DocumentHead from 'components/data/document-head';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import QueryMembershipsSubscriptions from 'components/data/query-memberships-subscriptions';
import formatCurrency from 'lib/format-currency';
import SectionHeader from 'components/section-header';

const MembershipsHistory = ( { translate, subscriptions, moment } ) => (
	<Main className="billing-history">
		<DocumentHead title={ translate( 'My Memberships' ) } />
		<PageViewTracker path="/me/purchases/memberships" title="Me > My Memberships" />
		<MeSidebarNavigation />
		<QueryMembershipsSubscriptions />
		<PurchasesHeader section={ 'memberships' } />
		<SectionHeader label={ translate( 'Active Membership plans' ) } />
		<Card className="billing-history__receipts">
			<table className="billing-history__transactions">
				<tbody>
					{ subscriptions &&
						subscriptions.map( subscription => {
							const endDate = moment( subscription.end_date ).format( 'll' );

							return (
								<tr key={ subscription.ID } className="billing-history__transaction">
									<td>{ endDate }</td>
									<td className="billing-history__trans-app">
										<div className="billing-history__trans-wrap">
											<div className="billing-history__service-description">
												<div className="billing-history__service-name">{ subscription.title }</div>
												<div className="billing-history__transaction-links">
													<a
														className="billing-history__view-receipt"
														href={ subscription.site_url }
													>
														on { subscription.site_title } &raquo;
													</a>
												</div>
											</div>
										</div>
									</td>
									<td className="billing-history__amount">
										{ formatCurrency( subscription.renewal_price, subscription.currency ) }
									</td>
								</tr>
							);
						}, this ) }
				</tbody>
			</table>
		</Card>
	</Main>
);

export default connect( state => ( {
	subscriptions: get( state, 'memberships.subscriptions.items', [] ),
} ) )( localize( MembershipsHistory ) );
