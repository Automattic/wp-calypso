/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import page from 'page';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import observe from 'lib/mixins/data-observe';
import Emojify from 'components/emojify';
import PostSummary from '../stats-post-summary';
import PostMonths from '../stats-detail-months';
import PostWeeks from '../stats-detail-weeks';
import HeaderCake from 'components/header-cake';
import { decodeEntities } from 'lib/formatting';
import Main from 'components/main';
import StatsFirstView from '../stats-first-view';

const StatsPostDetail = React.createClass( {
	mixins: [ observe( 'postViewsList' ) ],

	propTypes: {
		path: PropTypes.string,
		postViewsList: PropTypes.object
	},

	goBack() {
		const pathParts = this.props.path.split( '/' );
		const defaultBack = '/stats/' + pathParts[ pathParts.length - 1 ];

		page( this.props.context.prevPath || defaultBack );
	},

	componentDidMount() {
		window.scrollTo( 0, 0 );
	},

	render() {
		let title;

		const post = this.props.postViewsList.response.post;
		const isLoading = this.props.postViewsList.isLoading();
		const postOnRecord = post && post.post_title !== null;

		if ( postOnRecord ) {
			if ( typeof post.post_title === 'string' && post.post_title.length ) {
				title = <Emojify>{ decodeEntities( post.post_title ) }</Emojify>;
			}
		}

		if ( ! postOnRecord && ! isLoading ) {
			title = this.props.translate( 'We don\'t have that post on record yet.' );
		}

		return (
			<Main wideLayout={ true }>
				<StatsFirstView />

				<HeaderCake onClick={ this.goBack }>
					{ title }
				</HeaderCake>

				<PostSummary siteId={ this.props.siteId } postId={ this.props.postId } />

				<PostMonths
					dataKey="years"
					title={ this.props.translate( 'Months and Years' ) }
					total={ this.props.translate( 'Total' ) }
					postViewsList={ this.props.postViewsList } />

				<PostMonths
					dataKey="averages"
					title={ this.props.translate( 'Average per Day' ) }
					total={ this.props.translate( 'Overall' ) }
					postViewsList={ this.props.postViewsList } />

				<PostWeeks postViewsList={ this.props.postViewsList } />
			</Main>
		);
	}
} );

export default localize( StatsPostDetail );
