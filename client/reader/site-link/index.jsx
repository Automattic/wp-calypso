var React = require( 'react' );

var stats = require( 'reader/stats' );

var SiteLink = React.createClass( {

	recordClick: function() {
		stats.recordAction( 'visit_blog_feed' );
		stats.recordGaEvent( 'Clicked Feed Link' );
	},

	render: function() {
		var post = this.props.post,
			link;

		if ( post.feed_ID ) {
			link = '/read/blog/feed/' + post.feed_ID;
		} else if ( post.site_ID && ! post.is_external ) {
			link = '/read/blog/id/' + post.site_ID;
		}
		return (
			<a { ...this.props } href={ link } onClick={ this.recordClick }>{ this.props.children }</a>
		);
	}

} );

module.exports = SiteLink;
