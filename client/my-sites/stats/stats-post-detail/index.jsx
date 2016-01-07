/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import observe from 'lib/mixins/data-observe';
import SummaryChart from '../module-summary-chart';
import PostMonths from '../stats-detail-months';
import PostWeeks from '../stats-detail-weeks';
import Emojify from 'components/emojify';
import HeaderCake from 'components/header-cake';

export default React.createClass( {
	displayName: 'StatsPostDetail',

	mixins: [ observe( 'site', 'postViewsList' ) ],

	propTypes: {
		path: PropTypes.string,
		postViewsList: PropTypes.element
	},

	goBack() {
		const pathParts = this.props.path.split( '/' ),
			defaultBack = '/stats/' + pathParts[ pathParts.length - 1 ];

		page( this.props.context.prevPath || defaultBack );
	},

	componentDidMount() {
		window.scrollTo( 0, 0 );
	},

	render() {
		let title = '';

		if ( this.props.postViewsList.response.post && this.props.postViewsList.response.post.post_title ) {
			title = this.translate( 'Stats for %(posttitle)s', {
				comment: 'Title of the individual post stats page.',
				args: {
					posttitle: this.props.postViewsList.response.post.post_title
				}
			} );
		}

		if ( this.props.postViewsList.isError() ) {
			title = this.translate( 'We don\'t have that post on record yet.' );
		}

		return (
			<div className="main main-column" role="main">
				<div id="my-stats-content">
					<HeaderCake onClick={ this.goBack }>
						<Emojify>{ title }</Emojify>
					</HeaderCake>

					<SummaryChart
						key='chart'
						loading={ this.props.postViewsList.isLoading() }
						dataList={ this.props.postViewsList }
						barClick={ this.props.barClick }
						activeKey="period"
						dataKey='value'
						labelKey='period'
						labelClass="visible"
						tabLabel={ this.translate( 'Views' )} />

					<PostMonths
						dataKey="years"
						title={ this.translate( 'Months and Years' ) }
						total={ this.translate( 'Total' ) }
						postViewsList={ this.props.postViewsList } />

					<PostMonths
						dataKey="averages"
						title={ this.translate( 'Average per Day' ) }
						total={ this.translate( 'Overall' ) }
						postViewsList={ this.props.postViewsList } />

					<PostWeeks postViewsList={ this.props.postViewsList } />
				</div>
			</div>
		);
	}
} );
