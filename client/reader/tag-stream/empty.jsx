var React = require( 'react' );

var EmptyContent = require( 'components/empty-content' ),
	ExternalLink = require( 'components/external-link' ),
	stats = require( 'reader/stats' );

var TagEmptyContent = React.createClass( {
	shouldComponentUpdate: function() {
		return false;
	},

	recordAction: function() {
		stats.recordAction( 'clicked_tags_on_empty' );
		stats.recordGaEvent( 'Clicked Tags on EmptyContent' );
	},

	recordSecondaryAction: function() {
		stats.recordAction( 'clicked_discover_on_empty' );
		stats.recordGaEvent( 'Clicked Discover on EmptyContent' );
	},

	render: function() {
		var action = ( <a
			className="empty-content__action button"
			onClick={ this.recordSecondaryAction }
			href="/discover">{ this.translate( 'Explore Discover' ) }</a> );

		return ( <EmptyContent
			title={ this.translate( 'No recent posts…' ) }
			line={ this.translate( 'No posts have recently been tagged with this tag for your language.' ) }
			action={ action }
			illustration={ '/calypso/images/drake/drake-empty-results.svg' }
			illustrationWidth={ 500 }
			/> );
	}
} );

module.exports = TagEmptyContent;
