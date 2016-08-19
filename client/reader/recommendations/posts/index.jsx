var React = require( 'react' );

var Stream = require( 'reader/stream' ),
	EmptyContent = require( './empty' ),
	DocumentHead = require( 'components/data/document-head' );

var RecommendationPostsStream = React.createClass( {

	render: function() {
		var title = this.translate( 'Recommended Posts' ),
			emptyContent = ( <EmptyContent /> );

		return (
			<Stream { ...this.props }
				listName = { title }
				emptyContent = { emptyContent }
				showFollowInHeader = { true }
			>
				<DocumentHead title={ this.translate( '%s ‹ Reader', { args: title } ) } />
			</Stream>
		);
	}

} );

module.exports = RecommendationPostsStream;
