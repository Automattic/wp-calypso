var React = require( 'react' );

var EmptyContent = require( 'components/empty-content' ),
	ExternalLink = require( 'components/external-link' ),
	stats = require( 'reader/stats' );

var FollowingEmptyContent = React.createClass( {
	shouldComponentUpdate: function() {
		return false;
	},

	recordAction: function() {
		stats.recordAction( 'clicked_discover_on_empty' );
		stats.recordGaEvent( 'Clicked Discover on EmptyContent' );
	},

	recordSecondaryAction: function() {
		stats.recordAction( 'clicked_recommendations_on_empty' );
		stats.recordGaEvent( 'Clicked Recommendations on EmptyContent' );
	},

	render: function() {
		var action = (
			<a
				className="empty-content__action button is-primary"
				onClick={ this.recordAction }
				href="/discover">{ this.translate( 'Explore Discover' ) }</a> ),
			secondaryAction = (
				<a
					className="empty-content__action button"
					onClick={ this.recordSecondaryAction }
					href="/recommendations">{ this.translate( 'Get recommendations on who to follow' ) }</a> );

		return ( <EmptyContent
			title={ this.translate( 'Welcome to the Reader' ) }
			line={ this.translate( 'Recent posts from blogs and sites you follow will appear here.' ) }
			action={ action }
			secondaryAction={ secondaryAction }
			illustration={ '/calypso/images/drake/drake-all-done.svg' }
			illustrationWidth={ 500 }
			/> );
	}
} );

module.exports = FollowingEmptyContent;
