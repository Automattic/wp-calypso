/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import formatCurrency from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import Card from 'components/card';
import InfiniteScroll from 'components/infinite-scroll';
import './style.scss';
import QueryMembershipsEarnings from 'components/data/query-memberships-earnings';
import { requestSubscribers } from 'state/memberships/subscribers/actions';
import { decodeEntities } from 'lib/formatting';
import Gravatar from 'components/gravatar';

class MembershipsSection extends Component {
	componentDidMount() {
		this.fetchNextSubscriberPage( false, true );
	}
	renderEarnings() {
		const { translate } = this.props;
		return (
			<Card>
				<QueryMembershipsEarnings siteId={ this.props.siteId } />
				<div className="memberships__module-header module-header">
					<h1 className="memberships__module-header-title module-header-title">
						{ translate( 'Earnings' ) }
					</h1>
				</div>
				<div className="memberships__module-content module-content">
					<ul className="memberships__earnings-breakdown-list">
						<li className="memberships__earnings-breakdown-item">
							<span className="memberships__earnings-breakdown-label">
								{ translate( 'Total earnings', { context: 'Sum of earnings' } ) }
							</span>
							<span className="memberships__earnings-breakdown-value">
								{ formatCurrency( this.props.total, 'USD' ) /* TODO: make it multi-currency */ }
							</span>
						</li>
						<li className="memberships__earnings-breakdown-item">
							<span className="memberships__earnings-breakdown-label">
								{ translate( 'Last 30 days', { context: 'Sum of earnings over last 30 days' } ) }
							</span>
							<span className="memberships__earnings-breakdown-value">
								{ formatCurrency( this.props.lastMonth, 'USD' ) /* TODO: make it multi-currency */ }
							</span>
						</li>
						<li className="memberships__earnings-breakdown-item">
							<span className="memberships__earnings-breakdown-label">
								{ translate( 'Next month', {
									context: 'Forecast for the subscriptions due in the next 30 days',
								} ) }
							</span>
							<span className="memberships__earnings-breakdown-value">
								{ formatCurrency( this.props.forecast, 'USD' ) /* TODO: make it multi-currency */ }
							</span>
						</li>
					</ul>
				</div>
			</Card>
		);
	}

	fetchNextSubscriberPage( triggeredByInteraction, force ) {
		const fetched = Object.keys( this.props.subscribers ).length;
		if ( fetched < this.props.totalSubscribers || force ) {
			this.props.requestSubscribers( this.props.siteId, fetched );
		}
	}

	renderSubscriberList() {
		return (
			<Card>
				<div className="memberships__module-header module-header">
					<h1 className="memberships__module-header-title module-header-title">
						{ this.props.translate( 'Subscribers' ) }
					</h1>
				</div>
				<div className="memberships__module-content module-content">
					<div>
						{ Object.values( this.props.subscribers ).map( sub => this.renderSubscriber( sub ) ) }
					</div>
					<InfiniteScroll nextPageMethod={ this.fetchNextSubscriberPage } />
				</div>
			</Card>
		);
	}

	renderSubscriberSubscriptionSummary( subscriber ) {
		if ( subscriber.plan.renew_interval === 'one-time' ) {
			return this.props.translate( 'Paid %(amount)s once on %(formattedDate)s', {
				args: {
					amount: formatCurrency( subscriber.plan.renewal_price, subscriber.plan.currency ),
					formattedDate: this.props.moment( subscriber.start_date ).format( 'll' ),
				},
			} );
		} else if ( subscriber.plan.renew_interval === '1 year' ) {
			return this.props.translate( 'Paying %(amount)s/year since %(formattedDate)s', {
				args: {
					amount: formatCurrency( subscriber.plan.renewal_price, subscriber.plan.currency ),
					formattedDate: this.props.moment( subscriber.start_date ).format( 'll' ),
				},
			} );
		} else if ( subscriber.plan.renew_interval === '1 month' ) {
			return this.props.translate( 'Paying %(amount)s/month since %(formattedDate)s', {
				args: {
					amount: formatCurrency( subscriber.plan.renewal_price, subscriber.plan.currency ),
					formattedDate: this.props.moment( subscriber.start_date ).format( 'll' ),
				},
			} );
		}
	}

	renderSubscriber( subscriber ) {
		return (
			<Card className="memberships__subscriber-profile is-compact" key={ subscriber.id }>
				<div className="memberships__subscriber-gravatar">
					<Gravatar user={ subscriber.user } size={ 72 } />
				</div>
				<div className="memberships__subscriber-detail">
					<div className="memberships__subscriber-username">
						{ decodeEntities( subscriber.user.name ) }
					</div>
					<div className="memberships__subscriber-email" data-e2e-login={ subscriber.user_email }>
						<span>{ subscriber.user.user_email }</span>
					</div>
					<div className="memberships__subscriber-subscribed">
						{ this.renderSubscriberSubscriptionSummary( subscriber ) }
					</div>
				</div>
			</Card>
		);
	}

	render() {
		return (
			<div>
				{ this.renderEarnings() }
				{ this.renderSubscriberList() }
			</div>
		);
	}
}

const mapStateToProps = state => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );
	return {
		site,
		siteId,
		siteSlug: getSelectedSiteSlug( state ),
		total: get( state, [ 'memberships', 'earnings', 'summary', siteId, 'total' ], 0 ),
		lastMonth: get( state, [ 'memberships', 'earnings', 'summary', siteId, 'last_month' ], 0 ),
		forecast: get( state, [ 'memberships', 'earnings', 'summary', siteId, 'forecast' ], 0 ),
		totalSubscribers: get( state, [ 'memberships', 'subscribers', 'list', siteId, 'total' ], 0 ),
		subscribers: get( state, [ 'memberships', 'subscribers', 'list', siteId, 'ownerships' ], {} ),
	};
};

export default connect(
	mapStateToProps,
	{ requestSubscribers }
)( localize( MembershipsSection ) );
