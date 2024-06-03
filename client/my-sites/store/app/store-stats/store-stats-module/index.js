import { Card } from '@automattic/components';
import clsx from 'clsx';
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

	return (
		<div className={ clsx( 'store-stats-module', className ) }>
			{ header }
			{ isLoading && (
				<Card>
					<StatsModulePlaceholder isLoading={ isLoading } />
				</Card>
			) }
			{ ! isLoading && hasEmptyData && (
				<Card className="store-stats-module__card stats-module is-showing-error has-no-data">
					<ErrorPanel message={ emptyMessage } />
				</Card>
			) }
			{ ! isLoading && ! hasEmptyData && children }
		</div>
	);
}

StoreStatsModule.propTypes = {
	data: PropTypes.array,
	emptyMessage: PropTypes.string,
	header: PropTypes.node,
	siteId: PropTypes.number,
	statType: PropTypes.string,
	query: PropTypes.object,
	className: PropTypes.string,
};

export default connect( ( state, { siteId, statType, query } ) => {
	const statsData = getSiteStatsNormalizedData( state, siteId, statType, query );

	return {
		data: statType === 'statsOrders' ? statsData.data : statsData,
		requesting: isRequestingSiteStatsForQuery( state, siteId, statType, query ),
	};
} )( StoreStatsModule );
