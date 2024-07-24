import { SimplifiedSegmentedControl } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { get, flowRight } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import { STAT_TYPE_COMMENTS } from 'calypso/my-sites/stats/constants';
import { shouldGateStats } from 'calypso/my-sites/stats/hooks/use-should-gate-stats';
import StatsCardUpsell from 'calypso/my-sites/stats/stats-card-upsell';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import {
	getSiteStatsNormalizedData,
	hasSiteStatsQueryFailed,
	isRequestingSiteStatsForQuery,
} from 'calypso/state/stats/lists/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { INSIGHTS_SUPPORT_URL } from '../const';
import StatsErrorPanel from '../stats-error';
import StatsListCard from '../stats-list/stats-list-card';
import StatsModuleContent from '../stats-module/content-text';
import StatsModulePlaceholder from '../stats-module/placeholder';

import './style.scss';

/* eslint-disable wpcalypso/jsx-classname-namespace*/

class StatsComments extends Component {
	static propTypes = {
		commentsStatsData: PropTypes.object,
		commentFollowersTotal: PropTypes.number,
		hasCommentsStatsQueryFailed: PropTypes.bool,
		recordGoogleEvent: PropTypes.func,
		siteId: PropTypes.number,
		siteSlug: PropTypes.string,
		className: PropTypes.string,
		gateStatsComments: PropTypes.bool,
		skipQuery: PropTypes.bool,
	};

	state = {
		activeFilter: 'top-authors',
	};

	changeFilter = ( selection ) => {
		const filter = selection.value;
		if ( filter === this.state.activeFilter ) {
			return;
		}
		let gaEvent;
		switch ( filter ) {
			case 'top-authors':
				gaEvent = 'Clicked By Authors Comments Toggle';
				break;
			case 'top-content':
				gaEvent = 'Clicked By Posts & Pages Comments Toggle';
				break;
		}

		if ( gaEvent ) {
			this.props.recordGoogleEvent( 'Stats', gaEvent );
		}

		this.setState( {
			activeFilter: filter,
		} );
	};

	renderCommentFollowers() {
		const { commentFollowersTotal, siteSlug, translate, numberFormat } = this.props;

		if ( ! siteSlug || ! commentFollowersTotal ) {
			return null;
		}

		const commentFollowURL = '/stats/follows/comment/' + siteSlug;

		return (
			<StatsModuleContent className="module-content-text-stat">
				<p>
					{ translate( 'Total posts with comment subscribers:' ) }{ ' ' }
					<a href={ commentFollowURL }>{ numberFormat( commentFollowersTotal ) }</a>
				</p>
			</StatsModuleContent>
		);
	}

	renderSummary() {
		const data = get( this.props.commentsStatsData, 'authors' );
		if ( ! data || ! data.monthly_comments ) {
			return null;
		}

		return (
			<StatsModuleContent>
				<p>
					{ this.props.translate( 'Average comments per month:' ) }{ ' ' }
					{ this.props.numberFormat( data.monthly_comments ) }
				</p>
			</StatsModuleContent>
		);
	}

	render() {
		const {
			commentsStatsData,
			hasCommentsStatsQueryFailed: hasError,
			requestingCommentsStats,
			siteId,
			translate,
			className,
			gateStatsComments,
			skipQuery,
		} = this.props;
		const commentsAuthors = get( commentsStatsData, 'authors' );
		const commentsPosts = get( commentsStatsData, 'posts' );
		const noData = ! commentsAuthors;
		const selectOptions = [
			{
				value: 'top-authors',
				label: translate( 'By authors' ),
			},
			{
				value: 'top-content',
				label: translate( 'By posts & pages' ),
			},
		];

		const isLoading = requestingCommentsStats && ! commentsAuthors;
		let data = this.state.activeFilter === 'top-authors' ? commentsAuthors : commentsPosts;

		data = data?.map( ( item ) => ( { ...item, value: parseInt( item.value, 10 ) } ) );

		return (
			<>
				{ ! skipQuery && siteId && (
					<QuerySiteStats statType={ STAT_TYPE_COMMENTS } siteId={ siteId } />
				) }
				{ ! skipQuery && siteId && (
					<QuerySiteStats statType="statsCommentFollowers" siteId={ siteId } query={ { max: 7 } } />
				) }
				<StatsListCard
					moduleType="comments"
					data={ data }
					title={ translate( 'Comments' ) }
					emptyMessage={ translate(
						'{{link}}Top commentors{{/link}} on your pages will show here.',
						{
							comment: '{{link}} links to support documentation.',
							components: {
								link: <a href={ localizeUrl( `${ INSIGHTS_SUPPORT_URL }#:~:text=Comments:` ) } />,
							},
							context: 'Stats: Info box label when the Comments module is empty',
						}
					) }
					mainItemLabel={ translate( 'Author' ) }
					metricLabel={ translate( 'Comments' ) }
					splitHeader
					useShortNumber
					// Shares don't have a summary page yet.
					// TODO: limit to 5 items after summary page is added.
					// showMore={ ... }
					error={
						noData &&
						! hasError &&
						! requestingCommentsStats && (
							<StatsErrorPanel
								className="is-empty-message"
								message={ translate( 'No comments posted' ) }
							/>
						)
					}
					loader={ isLoading && <StatsModulePlaceholder isLoading={ isLoading } /> }
					toggleControl={
						<SimplifiedSegmentedControl options={ selectOptions } onSelect={ this.changeFilter } />
					}
					className={ clsx( 'stats__modernised-comments', className ) }
					showLeftIcon
					overlay={
						siteId &&
						gateStatsComments && (
							<StatsCardUpsell
								className="stats-module__upsell"
								statType={ STAT_TYPE_COMMENTS }
								siteId={ siteId }
							/>
						)
					}
				/>
			</>
		);
	}
}

const connectComponent = connect(
	( state, ownProps ) => {
		const siteId = getSelectedSiteId( state );
		const siteSlug = getSiteSlug( state, siteId );
		const gateStatsComments = shouldGateStats( state, siteId, STAT_TYPE_COMMENTS );

		return {
			commentFollowersTotal: get(
				getSiteStatsNormalizedData( state, siteId, 'statsCommentFollowers', { max: 7 } ),
				'total'
			),
			commentsStatsData: getSiteStatsNormalizedData( state, siteId, STAT_TYPE_COMMENTS, {} ),
			hasCommentsStatsQueryFailed: hasSiteStatsQueryFailed( state, siteId, STAT_TYPE_COMMENTS, {} ),
			requestingCommentsStats: isRequestingSiteStatsForQuery(
				state,
				siteId,
				STAT_TYPE_COMMENTS,
				{}
			),
			siteId,
			siteSlug,
			gateStatsComments,
			skipQuery: ownProps.skipQuery,
		};
	},
	{ recordGoogleEvent }
);

export default flowRight( connectComponent, localize )( StatsComments );
