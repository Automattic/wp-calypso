import isShallowEqual from '@wordpress/is-shallow-equal';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import statsStrings from 'calypso/my-sites/stats/stats-strings';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import {
	getEmailStatsNormalizedData,
	isRequestingEmailStats,
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
		requesting: PropTypes.bool,
	};

	static defaultProps = {
		showSummaryLink: false,
		query: {},
	};

	state = {
		loaded: false,
	};

	constructor( props ) {
		super( props );

		if ( ! props.requesting ) {
			this.state.loaded = true;
		}
	}

	componentDidUpdate( prevProps ) {
		if ( ! this.props.requesting && prevProps.requesting ) {
			// eslint-disable-next-line react/no-did-update-set-state
			this.setState( { loaded: true } );
		}

		if ( ! isShallowEqual( this.props.query, prevProps.query ) && this.state.loaded ) {
			// eslint-disable-next-line react/no-did-update-set-state
			this.setState( { loaded: false } );
		}
	}

	render() {
		const { path, data, postId, statType, query } = this.props;
		// Only show loading indicators when nothing is in state tree, and request in-flight
		const isLoading = ! this.state.loaded && ! ( data && data.length );
		const moduleStrings = statsStrings()[ path ];
		// TODO: Support error state in redux store
		const hasError = false;

		return (
			<>
				<StatsListCard
					title={ moduleStrings.title }
					moduleType={ path }
					data={ data }
					emptyMessage={ moduleStrings.empty }
					error={ hasError && <ErrorPanel /> }
					loader={ isLoading && <StatsModulePlaceholder isLoading={ isLoading } /> }
					heroElement={
						path === 'countries' && (
							<Geochart kind="email" statType={ statType } postId={ postId } query={ query } />
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
		requesting: isRequestingEmailStats( state, siteId, postId, period, statType ),
		data: getEmailStatsNormalizedData( state, siteId, postId, period, date, statType, path ),
		siteId,
		postId,
		siteSlug,
		query: {
			period,
			date,
		},
	};
} )( localize( StatsEmailModule ) );
