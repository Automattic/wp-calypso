/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import observe from 'lib/mixins/data-observe';
import analytics from 'lib/analytics';
import Card from 'components/card';
import CommentTab from './comment-tab';
import StatsErrorPanel from '../stats-error';
import StatsModulePlaceholder from '../stats-module/placeholder';
import StatsModuleContent from '../stats-module/content-text';
import StatsModuleSelectDropdown from '../stats-module/select-dropdown';
import SectionHeader from 'components/section-header';

export default React.createClass( {
	displayName: 'StatsComments',

	propTypes: {
		site: PropTypes.oneOfType( [
			PropTypes.object,
			PropTypes.bool
		] ),
		commentsList: PropTypes.object,
		commentFollowersList: PropTypes.object
	},

	mixins: [ observe( 'commentsList', 'commentFollowersList' ) ],

	data( nextProps ) {
		var props = nextProps || this.props;
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
		let gaEvent;
		const filter = selection.value;

		if ( filter !== this.state.activeFilter ) {
			switch ( filter ) {
				case 'top-authors':
					gaEvent = 'Clicked By Authors Comments Toggle';
					break;
				case 'top-content':
					gaEvent = 'Clicked By Posts & Pages Comments Toggle';
					break;
			}

			if ( gaEvent ) {
				analytics.ga.recordEvent( 'Stats', gaEvent );
			}

			this.setState( {
				activeFilter: filter
			} );
		}
	},

	updateHeaderState( options ) {
		this.setState( options );
	},

	renderCommentFollowers() {
		const { commentFollowersList, site } = this.props;

		if ( ! site || ! commentFollowersList.response.data || ! commentFollowersList.response.data.total ) {
			return null;
		}

		const commentFollowURL = '/stats/follows/comment/' + site.slug;

		return (
			<StatsModuleContent className="module-content-text-stat">
				<p>{ this.translate( 'Total posts with comment followers:' ) } <a href={ commentFollowURL }>{ this.numberFormat( commentFollowersList.response.data.total ) }</a></p>
			</StatsModuleContent>
		);
	},

	renderSummary() {
		const data = this.data();

		if ( ! data || ! data.monthly_comments ) {
			return null
		}

		return (
			<StatsModuleContent>
				<p>{ this.translate( 'Average comments per month:' ) } { this.numberFormat( data.monthly_comments ) }</p>
			</StatsModuleContent>
		);
	},

	render() {
		const { activeFilter } = this.state;
		const { commentsList, followList } = this.props;
		const hasError = commentsList.isError();
		const noData = commentsList.isEmpty( 'authors' );
		const data = this.data();
		const selectOptions = [
			{ value: 'top-authors', label: this.translate( 'Comments By Authors' ) },
			{ value: 'top-content', label: this.translate( 'Comments By Posts & Pages' ) }
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
				<SectionHeader label={ this.translate( 'Comments' ) }></SectionHeader>
				<Card className={ classes }>
					<div className="module-content">

						{ ( noData && ! hasError ) ? <StatsErrorPanel className="is-empty-message" message={ this.translate( 'No comments posted' ) } /> : null }

						<StatsModuleSelectDropdown
							options={ selectOptions }
							onSelect={ this.changeFilter } />

						{ this.renderCommentFollowers() }

						{ hasError ? <StatsErrorPanel className="network-error" /> : null }

						<CommentTab
							name="Top Commenters"
							value={ this.translate( 'Comments' ) }
							label={ this.translate( 'Author' ) }
							dataList={ commentsList }
							dataKey="authors"
							followList={ followList }
							isActive={ 'top-authors' === activeFilter } />

						<CommentTab
							name="Most Commented"
							value={ this.translate( 'Comments' ) }
							label={ this.translate( 'Title' ) }
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
