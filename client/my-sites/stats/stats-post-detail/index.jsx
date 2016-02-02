/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import page from 'page';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Emojify from 'components/emojify';
import SummaryChart from '../stats-summary-chart';
import PostMonths from '../stats-detail-months';
import PostWeeks from '../stats-detail-weeks';
import HeaderCake from 'components/header-cake';
import { fetchSiteStats } from 'state/stats/actions';
import { getStatsItem, isStatsItemFetching } from 'state/stats/selectors';

const StatsPostDetail = React.createClass( {
	displayName: 'StatsPostDetail',

	propTypes: {
		path: PropTypes.string
	},

	goBack() {
		const pathParts = this.props.path.split( '/' );
		const defaultBack = '/stats/' + pathParts[ pathParts.length - 1 ];

		page( this.props.context.prevPath || defaultBack );
	},

	componentWillMount() {
		this.dispatchFetchAction();
	},

	dispatchFetchAction() {
		const { domain, siteID, postID, statType } = this.props;
		const options = { post: postID };

		this.props.dispatch( fetchSiteStats( {
			domain,
			options,
			siteID,
			statType
		} ) );
	},

	componentDidMount() {
		window.scrollTo( 0, 0 );
	},

	render() {
		let title;

		const { moduleState } = this.props;
		const { statsPostViews } = moduleState;
		const response = statsPostViews.response
			? statsPostViews.response
			: { post: {}, data: [] };
		const { post } = response;
		const postOnRecord = post && post.post_title !== null;
		const isLoading = ! postOnRecord && this.props.isFetching;

		if ( postOnRecord ) {
			if ( typeof post.post_title === 'string' && post.post_title.length ) {
				title = <Emojify>{ post.post_title }</Emojify>;
			}
		} else {
			title = this.translate( 'We don\'t have that post on record yet.' );
		}

		return (
			<div className="main main-column" role="main">
				<HeaderCake onClick={ this.goBack }>
					{ title }
				</HeaderCake>

				<SummaryChart
					response={ response }
					isLoading={ isLoading }
					key="chart"
					barClick={ this.props.barClick }
					activeKey="period"
					dataKey="value"
					labelKey="period"
					labelClass="visible"
					tabLabel={ this.translate( 'Views' ) } />

				<PostMonths
					response={ response }
					isLoading={ isLoading }
					dataKey="years"
					title={ this.translate( 'Months and Years' ) }
					total={ this.translate( 'Total' ) }
				/>

				<PostMonths
					response={ response }
					isLoading={ isLoading }
					dataKey="averages"
					title={ this.translate( 'Average per Day' ) }
					total={ this.translate( 'Overall' ) }
				/>

				<PostWeeks response={ response } />
			</div>
		);
	}
} );

export default connect(
	function mapStateToProps( state, ownProps ) {
		const { siteID, postID, statType } = ownProps;
		const params = { siteID, statType, options: { post: postID } };
		const moduleState = {
			[ statType ]: {
				response: getStatsItem( state, params ),
				isFetching: isStatsItemFetching( state, params )
			}
		};

		return { moduleState };
	}
)( StatsPostDetail );
