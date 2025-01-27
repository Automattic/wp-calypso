import { localize, translate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import statsStrings from 'calypso/my-sites/stats/stats-strings';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import {
	getEmailStatsNormalizedData,
	shouldShowLoadingIndicator,
} from 'calypso/state/stats/emails/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import Geochart from '../geochart';
import ErrorPanel from '../stats-error';
import StatsListCard from '../stats-list/stats-list-card';
import StatsModulePlaceholder from '../stats-module/placeholder';

import '../stats-module/style.scss';

class StatsEmailModule extends Component {
	static propTypes = {
		period: PropTypes.string,
		path: PropTypes.string,
		siteSlug: PropTypes.string,
		siteId: PropTypes.number,
		data: PropTypes.array,
		query: PropTypes.object,
		statType: PropTypes.string,
		isLoading: PropTypes.bool,
	};

	static defaultProps = {
		showSummaryLink: false,
		query: {},
	};

	render() {
		const { path, data, postId, statType, query, isLoading } = this.props;
		// Only show loading indicators when nothing is in state tree, and request in-flight
		const moduleStrings = statsStrings()[ path ];
		// TODO: Support error state in redux store
		const hasError = false;
		const metricLabel = statType === 'clicks' ? translate( 'Clicks' ) : translate( 'Opens' );

		return (
			<>
				<StatsListCard
					title={ moduleStrings.title }
					moduleType={ path }
					data={ data }
					emptyMessage={ moduleStrings.empty }
					error={ hasError && <ErrorPanel /> }
					loader={ isLoading && <StatsModulePlaceholder isLoading={ isLoading } /> }
					metricLabel={ metricLabel }
					heroElement={
						path === 'countries' && (
							<Geochart
								kind="email"
								statType={ statType }
								postId={ postId }
								query={ query }
								isLoading={ isLoading }
								numberLabel={ metricLabel }
							/>
						)
					}
				/>
			</>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSiteSlug( state, siteId );
	const { postId, period, date, statType, path } = ownProps;

	return {
		isLoading: shouldShowLoadingIndicator( state, siteId, postId, period, statType, date, path ),
		data: getEmailStatsNormalizedData( state, siteId, postId, period, statType, date, path ),
		siteId,
		postId,
		siteSlug,
		query: {
			period,
			date,
		},
	};
} )( localize( StatsEmailModule ) );
