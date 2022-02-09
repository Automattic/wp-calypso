import { Card } from '@automattic/components';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ErrorPanel from 'calypso/my-sites/stats/stats-error';
import StatsModulePlaceholder from 'calypso/my-sites/stats/stats-module/placeholder';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData,
} from 'calypso/state/stats/lists/selectors';

function StoreStatsModule( { header, children, data, emptyMessage, className, requesting } ) {
	const isLoading = requesting && ! ( data && data.length );
	const hasEmptyData = ! requesting && data && data.length === 0;
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

StoreStatsModule.propTypes = {
	data: PropTypes.array,
	emptyMessage: PropTypes.string,
	header: PropTypes.node,
	siteId: PropTypes.number,
	statType: PropTypes.string,
	query: PropTypes.object,
	fetchedData: PropTypes.oneOfType( [ PropTypes.array, PropTypes.object ] ),
	className: PropTypes.string,
};

export default connect( ( state, { siteId, statType, query, fetchedData } ) => {
	const statsData = fetchedData
		? fetchedData
		: getSiteStatsNormalizedData( state, siteId, statType, query );
	return {
		data: statType === 'statsOrders' ? statsData.data : statsData,
		requesting: isRequestingSiteStatsForQuery( state, siteId, statType, query ),
	};
} )( StoreStatsModule );
