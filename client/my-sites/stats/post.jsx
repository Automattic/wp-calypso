/**
 * External dependencies
 */
var React = require( 'react' ),
	page = require( 'page' ),
	debug = require( 'debug' )( 'calypso:stats:post' );

/**
 * Internal dependencies
 */
var observe = require( 'lib/mixins/data-observe' ),
	SummaryChart = require( './module-summary-chart' ),
	PostMonths = require( './module-post-months' ),
	PostWeeks = require( './module-post-weeks' ),
	Emojify = require( 'components/emojify' ),
	HeaderCake = require( 'components/header-cake' );

module.exports = React.createClass( {
	displayName: 'StatsPost',

	mixins: [ observe( 'site', 'postViewsList' ) ],

	goBack: function() {
		var pathParts = this.props.path.split( '/' ),
			defaultBack = '/stats/' + pathParts[ pathParts.length - 1 ];

		page( this.props.context.prevPath || defaultBack );
	},

	componentDidMount: function() {
		window.scrollTo( 0, 0 );
	},

	render: function() {
		var title = '';

		debug( 'Rendering stats/post.jsx', this.props );

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

					<SummaryChart key='chart' loading={ this.props.postViewsList.isLoading() } dataList={ this.props.postViewsList } barClick={ this.props.barClick } activeKey="period" dataKey='value' labelKey='period' labelClass="visible" tabLabel={ this.translate( 'Views' )} />

					<PostMonths dataKey="years" title={ this.translate( 'Months and Years' ) } total={ this.translate( 'Total' ) } postViewsList={ this.props.postViewsList } />
					<PostMonths dataKey="averages" title={ this.translate( 'Average per Day' ) } total={ this.translate( 'Overall' ) } postViewsList={ this.props.postViewsList } />
					<PostWeeks postViewsList={ this.props.postViewsList } />
				</div>
			</div>
		);
	}
} );
