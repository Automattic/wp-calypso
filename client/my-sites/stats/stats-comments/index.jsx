import config from '@automattic/calypso-config';
import { Card } from '@automattic/components';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { get, flowRight } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import SectionHeader from 'calypso/components/section-header';
import SimplifiedSegmentedControl from 'calypso/components/segmented-control/simplified';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import {
	getSiteStatsNormalizedData,
	hasSiteStatsQueryFailed,
	isRequestingSiteStatsForQuery,
} from 'calypso/state/stats/lists/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import StatsErrorPanel from '../stats-error';
import StatsListCard from '../stats-list/stats-list-card';
import StatsModuleContent from '../stats-module/content-text';
import StatsModulePlaceholder from '../stats-module/placeholder';
import StatsModuleSelectDropdown from '../stats-module/select-dropdown';
import CommentTab from './comment-tab';

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
		const { activeFilter } = this.state;
		const {
			commentsStatsData,
			hasCommentsStatsQueryFailed: hasError,
			requestingCommentsStats,
			siteId,
			translate,
			isInsightsPageGridEnabled,
		} = this.props;
		const commentsAuthors = get( commentsStatsData, 'authors' );
		const commentsPosts = get( commentsStatsData, 'posts' );
		const noData = ! commentsAuthors;
		const selectOptions = [
			{
				value: 'top-authors',
				label: ! isInsightsPageGridEnabled
					? translate( 'Comments by authors' )
					: translate( 'By authors' ),
			},
			{
				value: 'top-content',
				label: ! isInsightsPageGridEnabled
					? translate( 'Comments by posts & pages' )
					: translate( 'By posts & pages' ),
			},
		];

		const classes = classNames( 'stats-module', {
			'is-loading': ! commentsAuthors,
			'has-no-data': noData,
			'is-showing-error': hasError || noData,
		} );

		const isLoading = requestingCommentsStats && ! commentsAuthors;
		let data = this.state.activeFilter === 'top-authors' ? commentsAuthors : commentsPosts;

		data = data?.map( ( item ) => ( { ...item, value: parseInt( item.value, 10 ) } ) );

		return (
			<>
				{ siteId && <QuerySiteStats statType="statsComments" siteId={ siteId } /> }
				{ siteId && (
					<QuerySiteStats statType="statsCommentFollowers" siteId={ siteId } query={ { max: 7 } } />
				) }
				{ isInsightsPageGridEnabled && (
					<StatsListCard
						moduleType="comments"
						data={ data }
						title={ translate( 'Comments' ) }
						emptyMessage={ translate( 'No comments posted' ) }
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
							<SimplifiedSegmentedControl
								options={ selectOptions }
								onSelect={ this.changeFilter }
							/>
						}
						className="stats__modernised-comments"
					/>
				) }
				{ ! isInsightsPageGridEnabled && (
					<div className="list-comments">
						<SectionHeader label={ translate( 'Comments' ) } />
						<Card className={ classes }>
							<div className="module-content">
								{ noData && ! hasError && ! requestingCommentsStats && (
									<StatsErrorPanel
										className="is-empty-message"
										message={ translate( 'No comments posted' ) }
									/>
								) }

								<StatsModuleSelectDropdown
									options={ selectOptions }
									onSelect={ this.changeFilter }
								/>

								{ this.renderCommentFollowers() }

								{ hasError ? <StatsErrorPanel className="network-error" /> : null }

								<CommentTab
									name="Top Commenters"
									value={ translate( 'Comments' ) }
									label={ translate( 'Author' ) }
									data={ commentsAuthors }
									isActive={ 'top-authors' === activeFilter }
								/>

								<CommentTab
									name="Most Commented"
									value={ translate( 'Comments' ) }
									label={ translate( 'Title' ) }
									data={ commentsPosts }
									isActive={ 'top-content' === activeFilter }
								/>

								{ this.renderSummary() }
								<StatsModulePlaceholder
									isLoading={ requestingCommentsStats && ! commentsAuthors }
								/>
							</div>
						</Card>
					</div>
				) }
			</>
		);
	}
}

const connectComponent = connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const siteSlug = getSiteSlug( state, siteId );

		return {
			commentFollowersTotal: get(
				getSiteStatsNormalizedData( state, siteId, 'statsCommentFollowers', { max: 7 } ),
				'total'
			),
			commentsStatsData: getSiteStatsNormalizedData( state, siteId, 'statsComments', {} ),
			hasCommentsStatsQueryFailed: hasSiteStatsQueryFailed( state, siteId, 'statsComments', {} ),
			requestingCommentsStats: isRequestingSiteStatsForQuery( state, siteId, 'statsComments', {} ),
			siteId,
			siteSlug,
			isInsightsPageGridEnabled: config.isEnabled( 'stats/insights-page-grid' ),
		};
	},
	{ recordGoogleEvent }
);

export default flowRight( connectComponent, localize )( StatsComments );
