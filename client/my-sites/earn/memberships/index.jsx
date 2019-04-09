/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import QueryMembershipsEarnings from 'components/data/query-memberships-earnings';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import Card from 'components/card';
import './style.scss';

class MembershipsSection extends Component {
	render() {
		const { translate } = this.props;
		return (
			<div>
				<QueryMembershipsEarnings siteId={ this.props.siteId } />
				<Card>
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
									${ this.props.numberFormat( this.props.total, 2 ) }
								</span>
							</li>
							<li className="memberships__earnings-breakdown-item">
								<span className="memberships__earnings-breakdown-label">
									{ translate( 'Last 30 days', { context: 'Sum of earnings over last 30 days' } ) }
								</span>
								<span className="memberships__earnings-breakdown-value">
									${ this.props.numberFormat( this.props.lastMonth, 2 ) }
								</span>
							</li>
							<li className="memberships__earnings-breakdown-item">
								<span className="memberships__earnings-breakdown-label">
									{ translate( 'Next month', {
										context: 'Forecast for the subscriptions due in the next 30 days',
									} ) }
								</span>
								<span className="memberships__earnings-breakdown-value">
									${ this.props.numberFormat( this.props.forecast, 2 ) }
								</span>
							</li>
						</ul>
					</div>
				</Card>
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
	};
};

export default connect( mapStateToProps )( localize( MembershipsSection ) );
