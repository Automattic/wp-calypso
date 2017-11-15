/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData,
} from 'state/stats/lists/selectors';
import StatsModulePlaceholder from 'my-sites/stats/stats-module/placeholder';
import ErrorPanel from 'my-sites/stats/stats-error';

class StoreStatsModule extends Component {
	static propTypes = {
		data: PropTypes.array,
		emptyMessage: PropTypes.string,
		header: PropTypes.node,
		siteId: PropTypes.number,
		statType: PropTypes.string,
		query: PropTypes.object,
	};

	state = {
		loaded: false,
	};

	componentWillReceiveProps( nextProps ) {
		if ( ! nextProps.requesting && this.props.requesting ) {
			this.setState( { loaded: true } );
		}

		if ( ! isEqual( nextProps.query, this.props.query ) && this.state.loaded ) {
			this.setState( { loaded: false } );
		}
	}

	render() {
		const { header, children, data, emptyMessage } = this.props;
		const { loaded } = this.state;
		const isLoading = ! loaded && ! ( data && data.length );
		const hasEmptyData = loaded && data && data.length === 0;
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<div className="store-stats-module">
				{ header }
				{ isLoading && (
					<Card>
						<StatsModulePlaceholder isLoading={ isLoading } />
					</Card>
				) }
				{ ! isLoading &&
					hasEmptyData && (
						<Card className="stats-module is-showing-error has-no-data">
							<ErrorPanel message={ emptyMessage } />
						</Card>
					) }
				{ ! isLoading && ! hasEmptyData && children }
			</div>
			/* eslint-enable wpcalypso/jsx-classname-namespace */
		);
	}
}

export default connect( ( state, { siteId, statType, query } ) => {
	const statsData = getSiteStatsNormalizedData( state, siteId, statType, query );
	return {
		data: statType === 'statsOrders' ? statsData.data : statsData,
		requesting: isRequestingSiteStatsForQuery( state, siteId, statType, query ),
	};
} )( StoreStatsModule );
