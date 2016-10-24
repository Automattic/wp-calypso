const React = require( 'react' );

const EmptyContent = require( 'components/empty-content' ),
	stats = require( 'reader/stats' ),
	discoverHelper = require( 'reader/discover/helper' );

const SearchEmptyContent = React.createClass( {

	propTypes: {
		query: React.PropTypes.string
	},

	shouldComponentUpdate: function() {
		return false;
	},

	recordAction: function() {
		stats.recordAction( 'clicked_following_on_empty' );
		stats.recordGaEvent( 'Clicked Following on EmptyContent' );
		stats.recordTrack( 'calypso_reader_following_on_empty_search_stream_clicked' );
	},

	recordSecondaryAction: function() {
		stats.recordAction( 'clicked_discover_on_empty' );
		stats.recordGaEvent( 'Clicked Discover on EmptyContent' );
		stats.recordTrack( 'calypso_reader_discover_on_empty_search_stream_clicked' );
	},

	render: function() {
		const action = ( <a
			className="empty-content__action button is-primary"
			onClick={ this.recordAction }
			href="/">{ this.translate( 'Back to Following' ) }</a> );

		const secondaryAction = discoverHelper.isDiscoverEnabled()
			? ( <a
			className="empty-content__action button"
			onClick={ this.recordSecondaryAction }
			href="/discover">{ this.translate( 'Explore Discover' ) }</a> ) : null;

		const message = this.translate(
			'No posts found for {{query /}} for your language.',
			{ components: { query: <em>{ this.props.query }</em> } }
		);

		return ( <EmptyContent
			title={ this.translate( 'No Results' ) }
			line={ message }
			action={ action }
			secondaryAction={ secondaryAction }
			illustration={ '/calypso/images/drake/drake-empty-results.svg' }
			illustrationWidth={ 500 }
			/> );
	}
} );

module.exports = SearchEmptyContent;
