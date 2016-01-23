var React = require( 'react' );

var EmptyContent = require( 'components/empty-content' ),
	stats = require( 'reader/stats' ),
	discoverHelper = require( 'reader/discover/helper' );

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
		var action = discoverHelper.isEnabled()
			? ( <a
			className="empty-content__action button"
			onClick={ this.recordSecondaryAction }
			href="/discover">{ this.translate( 'Explore Discover' ) }</a> ) : null;

		return ( <EmptyContent
			title={ this.translate( 'No recent posts…' ) }
			line={ this.translate( 'No posts have recently been tagged with %(tag)s for your language', { args: { tag: this.props.tag } } ) }
			action={ action }
			illustration={ '/calypso/images/drake/drake-empty-results.svg' }
			illustrationWidth={ 500 }
			/> );
	}
} );

module.exports = TagEmptyContent;
