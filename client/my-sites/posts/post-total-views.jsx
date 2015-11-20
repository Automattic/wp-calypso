/**
 * External dependencies
 */
var React = require('react'),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var StatUpdateIndicator = require( 'components/stat-update-indicator' ),
	postStatsStore = require( 'lib/post-stats/store' ),
	Gridicon = require( 'components/gridicon'),
	HEARTBEAT_IN_SECONDS = 60;

var PostTotalViews = React.createClass( {

	propTypes: {
		post: React.PropTypes.object.isRequired,
		clickHandler: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			totalViews: this.getTotalViews()
		};
	},

	componentWillMount: function() {
		postStatsStore.on( 'change', this.handleChange );

		this.interval = setInterval( function() {
			// Keep it fresh!
			this.getTotalViews();

		}.bind( this ), HEARTBEAT_IN_SECONDS * 1000 );
	},

	componentWillUnmount: function() {
		clearInterval( this.interval );
		postStatsStore.off( 'change', this.handleChange );
	},

	handleChange: function() {
		var totalViews = this.getTotalViews();

		if ( this.state.totalViews === totalViews ) {
			return;
		}

		this.setState( {
			totalViews: totalViews
		} );
	},

	getTotalViews: function() {
		var post = this.props.post,
			postId = post.ID,
			siteId = post.site_ID;

		return postStatsStore.getItem( 'totalViews', siteId, postId );
	},

	render: function() {
		var views = this.state.totalViews,
			post = this.props.post,
			postId = post.ID,
			siteId = post.site_ID,
			viewsCountDisplay = '',
			viewsTitle;

		if ( views && ! isNaN( views ) ) {
			viewsCountDisplay = this.numberFormat( views );
			viewsTitle = this.translate( '1 Total View', '%(count)s Total Views', {
				count: views,
				args: {
					count: views
				}
			} );
		} else {
			viewsTitle = this.translate( 'Total Views' );
		}

		return (
			<a href={ '/stats/post/' + postId + '/' + siteId }
				className={ classNames( {
					'post__total-views': true,
					'is-empty': ! viewsCountDisplay
				} ) }
				title={ viewsTitle }
				onClick={ this.props.clickHandler }>
				<Gridicon icon="visible" size={ 24 } />
				<StatUpdateIndicator updateOn={ viewsCountDisplay }>{ viewsCountDisplay }</StatUpdateIndicator>
			</a>
		);
	}
} );

module.exports = PostTotalViews;
