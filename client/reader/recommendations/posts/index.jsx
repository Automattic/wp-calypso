var React = require( 'react' );

var Stream = require( 'reader/stream' ),
	EmptyContent = require( './empty' );

var RecommendationPostsStream = React.createClass( {

	render: function() {
		var title = this.translate( 'Recommended Posts' ),
			emptyContent = ( <EmptyContent /> );

		if ( this.props.setPageTitle ) {
			this.props.setPageTitle( title );
		}
		return (
			<Stream { ...this.props }
				listName = { title }
				emptyContent = { emptyContent }
				showFollowInHeader = { true }
			/>
		);
	}

} );

module.exports = RecommendationPostsStream;
