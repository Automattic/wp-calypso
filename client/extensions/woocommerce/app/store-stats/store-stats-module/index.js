/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { isEqual } from 'lodash';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData,
} from 'calypso/state/stats/lists/selectors';
import StatsModulePlaceholder from 'calypso/my-sites/stats/stats-module/placeholder';
import ErrorPanel from 'calypso/my-sites/stats/stats-error';

class StoreStatsModule extends Component {
	static propTypes = {
		data: PropTypes.array,
		emptyMessage: PropTypes.string,
		header: PropTypes.node,
		siteId: PropTypes.number,
		statType: PropTypes.string,
		query: PropTypes.object,
		fetchedData: PropTypes.oneOfType( [ PropTypes.array, PropTypes.object ] ),
		className: PropTypes.string,
	};

	state = {
		loaded: false,
	};

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( ! nextProps.requesting && this.props.requesting ) {
			this.setState( { loaded: true } );
		}

		if ( ! isEqual( nextProps.query, this.props.query ) && this.state.loaded ) {
			this.setState( { loaded: false } );
		}
	}

	render() {
		const { header, children, data, emptyMessage, className } = this.props;
		const { loaded } = this.state;
		const isLoading = ! loaded && ! ( data && data.length );
		const hasEmptyData = loaded && data && data.length === 0;
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<div className={ classnames( 'store-stats-module', className ) }>
				{ header }
				{ isLoading && (
					<Card>
						<StatsModulePlaceholder isLoading={ isLoading } />
					</Card>
				) }
				{ ! isLoading && hasEmptyData && (
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

export default connect( ( state, { siteId, statType, query, fetchedData } ) => {
	const statsData = fetchedData
		? fetchedData
		: getSiteStatsNormalizedData( state, siteId, statType, query );
	return {
		data: statType === 'statsOrders' ? statsData.data : statsData,
		requesting: isRequestingSiteStatsForQuery( state, siteId, statType, query ),
	};
} )( StoreStatsModule );
