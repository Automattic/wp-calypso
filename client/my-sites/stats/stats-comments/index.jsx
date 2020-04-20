/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get, flowRight } from 'lodash';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import CommentTab from './comment-tab';
import StatsErrorPanel from '../stats-error';
import StatsModulePlaceholder from '../stats-module/placeholder';
import StatsModuleContent from '../stats-module/content-text';
import StatsModuleSelectDropdown from '../stats-module/select-dropdown';
import SectionHeader from 'components/section-header';
import QuerySiteStats from 'components/data/query-site-stats';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import {
	getSiteStatsNormalizedData,
	hasSiteStatsQueryFailed,
	isRequestingSiteStatsForQuery,
} from 'state/stats/lists/selectors';
import { recordGoogleEvent } from 'state/analytics/actions';

/**
 * Style dependencies
 */
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
					{ translate( 'Total posts with comment followers:' ) }{ ' ' }
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
			followList,
			hasCommentsStatsQueryFailed: hasError,
			requestingCommentsStats,
			siteId,
			translate,
		} = this.props;
		const commentsAuthors = get( commentsStatsData, 'authors' );
		const commentsPosts = get( commentsStatsData, 'posts' );
		const noData = ! commentsAuthors;
		const selectOptions = [
			{ value: 'top-authors', label: translate( 'Comments By Authors' ) },
			{ value: 'top-content', label: translate( 'Comments By Posts & Pages' ) },
		];

		const classes = classNames( 'stats-module', {
			'is-loading': ! commentsAuthors,
			'has-no-data': noData,
			'is-showing-error': hasError || noData,
		} );

		return (
			<div>
				{ siteId && <QuerySiteStats statType="statsComments" siteId={ siteId } /> }
				{ siteId && (
					<QuerySiteStats statType="statsCommentFollowers" siteId={ siteId } query={ { max: 7 } } />
				) }
				<SectionHeader label={ translate( 'Comments' ) } />
				<Card className={ classes }>
					<div className="module-content">
						{ noData && ! hasError && ! requestingCommentsStats && (
							<StatsErrorPanel
								className="is-empty-message"
								message={ translate( 'No comments posted' ) }
							/>
						) }

						<StatsModuleSelectDropdown options={ selectOptions } onSelect={ this.changeFilter } />

						{ this.renderCommentFollowers() }

						{ hasError ? <StatsErrorPanel className="network-error" /> : null }

						<CommentTab
							name="Top Commenters"
							value={ translate( 'Comments' ) }
							label={ translate( 'Author' ) }
							data={ commentsAuthors }
							followList={ followList }
							isActive={ 'top-authors' === activeFilter }
						/>

						<CommentTab
							name="Most Commented"
							value={ translate( 'Comments' ) }
							label={ translate( 'Title' ) }
							data={ commentsPosts }
							followList={ followList }
							isActive={ 'top-content' === activeFilter }
						/>

						{ this.renderSummary() }
						<StatsModulePlaceholder isLoading={ requestingCommentsStats && ! commentsAuthors } />
					</div>
				</Card>
			</div>
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
		};
	},
	{ recordGoogleEvent }
);

export default flowRight( connectComponent, localize )( StatsComments );
