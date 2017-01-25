/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';

/**
 * Internal dependencies
 */
import observe from 'lib/mixins/data-observe';
import Card from 'components/card';
import CommentTab from './comment-tab';
import StatsErrorPanel from '../stats-error';
import StatsModulePlaceholder from '../stats-module/placeholder';
import StatsModuleContent from '../stats-module/content-text';
import StatsModuleSelectDropdown from '../stats-module/select-dropdown';
import SectionHeader from 'components/section-header';
import QuerySiteStats from 'components/data/query-site-stats';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { getSiteStatsNormalizedData } from 'state/stats/lists/selectors';
import { recordGoogleEvent } from 'state/analytics/actions';

const StatsComments = React.createClass( {
	propTypes: {
		commentFollowersData: PropTypes.object,
		commentsList: PropTypes.object,
		recordGoogleEvent: PropTypes.func,
		siteId: PropTypes.number,
		siteSlug: PropTypes.string
	},

	mixins: [ observe( 'commentsList' ) ],

	data( nextProps ) {
		const props = nextProps || this.props;
		return props.commentsList.response.data.authors;
	},

	getInitialState() {
		return {
			activeFilter: 'top-authors',
			noData: this.props.commentsList.isEmpty( 'authors' ),
			showInfo: false,
			showModule: true
		};
	},

	componentWillReceiveProps( nextProps ) {
		this.setState( {
			noData: nextProps.commentsList.isEmpty( 'authors' )
		} );
	},

	changeFilter( selection ) {
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
			activeFilter: filter
		} );
	},

	updateHeaderState( options ) {
		this.setState( options );
	},

	renderCommentFollowers() {
		const { commentFollowersData, siteSlug, translate, numberFormat } = this.props;

		if ( ! siteSlug || ! commentFollowersData || ! commentFollowersData.total ) {
			return null;
		}

		const commentFollowURL = '/stats/follows/comment/' + siteSlug;

		return (
			<StatsModuleContent className="module-content-text-stat">
				<p>
					{ translate( 'Total posts with comment followers:' ) }
					<a href={ commentFollowURL }>
						{ numberFormat( commentFollowersData.total ) }
					</a>
				</p>
			</StatsModuleContent>
		);
	},

	renderSummary() {
		const data = this.data();
		if ( ! data || ! data.monthly_comments ) {
			return null;
		}

		return (
			<StatsModuleContent>
				<p>{ this.props.translate( 'Average comments per month:' ) } { this.props.numberFormat( data.monthly_comments ) }</p>
			</StatsModuleContent>
		);
	},

	render() {
		const { activeFilter } = this.state;
		const { commentsList, followList, siteId, translate } = this.props;
		const hasError = commentsList.isError();
		const noData = commentsList.isEmpty( 'authors' );
		const data = this.data();
		const selectOptions = [
			{ value: 'top-authors', label: translate( 'Comments By Authors' ) },
			{ value: 'top-content', label: translate( 'Comments By Posts & Pages' ) }
		];

		const classes = classNames(
			'stats-module',
			{
				'is-loading': ! data,
				'has-no-data': noData,
				'is-showing-error': hasError || noData
			}
		);

		return (
			<div>
				<QuerySiteStats statType="statsCommentFollowers" siteId={ siteId } query={ { max: 7 } } />
				<SectionHeader label={ translate( 'Comments' ) }></SectionHeader>
				<Card className={ classes }>
					<div className="module-content">

						{ noData && ! hasError &&
							<StatsErrorPanel className="is-empty-message" message={ translate( 'No comments posted' ) } />
						}

						<StatsModuleSelectDropdown
							options={ selectOptions }
							onSelect={ this.changeFilter } />

						{ this.renderCommentFollowers() }

						{ hasError ? <StatsErrorPanel className="network-error" /> : null }

						<CommentTab
							name="Top Commenters"
							value={ translate( 'Comments' ) }
							label={ translate( 'Author' ) }
							dataList={ commentsList }
							dataKey="authors"
							followList={ followList }
							isActive={ 'top-authors' === activeFilter } />

						<CommentTab
							name="Most Commented"
							value={ translate( 'Comments' ) }
							label={ translate( 'Title' ) }
							dataList={ commentsList }
							dataKey="posts"
							followList={ followList }
							isActive={ 'top-content' === activeFilter } />

						{ this.renderSummary }
						<StatsModulePlaceholder isLoading={ ! data } />
					</div>
				</Card>
			</div>
		);
	}
} );

const connectComponent = connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const siteSlug = getSiteSlug( state, siteId );

		return {
			commentFollowersData: getSiteStatsNormalizedData( state, siteId, 'statsCommentFollowers', { max: 7 } ),
			siteId,
			siteSlug
		};
	},
	{ recordGoogleEvent }
);

export default flowRight(
	connectComponent,
	localize
)( StatsComments );
