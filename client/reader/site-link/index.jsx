var React = require( 'react' );

var stats = require( 'reader/stats' ),
	urlHelper = require( 'reader/url-helper' );

var SiteLink = React.createClass( {

	recordClick: function() {
		stats.recordAction( 'visit_blog_feed' );
		stats.recordGaEvent( 'Clicked Feed Link' );
	},

	render: function() {
		var link = urlHelper.getStreamUrlFromPost( this.props.post );

		return (
			<a { ...this.props } href={ link } onClick={ this.recordClick }>{ this.props.children }</a>
		);
	}

} );

module.exports = SiteLink;
