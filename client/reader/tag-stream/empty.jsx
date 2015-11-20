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
		stats.recordAction( 'clicked_freshly_pressed_on_empty' );
		stats.recordGaEvent( 'Clicked Freshly Pressed on EmptyContent' );
	},

	render: function() {
		var action = ( <ExternalLink
			className="empty-content__action button is-primary"
			onClick={ this.recordAction }
			href="https://wordpress.com/tags/">{ this.translate( 'Explore Tags' ) }</ExternalLink> ),
			secondaryAction = ( <ExternalLink
				className="empty-content__action button"
				onClick={ this.recordSecondaryAction }
				href="https://wordpress.com/fresh/">{ this.translate( 'Explore our Editors\' Picks' ) }</ExternalLink> );

		return ( <EmptyContent
			title={ this.translate( 'No recent posts…' ) }
			line={ this.translate( 'No posts have recently been tagged with this tag for your language.' ) }
			action={ action }
			secondaryAction={ secondaryAction }
			illustration={ '/calypso/images/drake/drake-empty-results.svg' }
			illustrationWidth={ 500 }
			/> );
	}
} );

module.exports = TagEmptyContent;
