var React = require( 'react' );

var Stream = require( 'reader/stream' ),
	EmptyContent = require( './empty' ),
	DocumentHead = require( 'components/data/document-head' );

var LikedStream = React.createClass( {

	render: function() {
		var title = this.translate( 'My Likes' ),
			emptyContent = ( <EmptyContent /> );

		return (
			<Stream { ...this.props } listName={ title } emptyContent={ emptyContent } showFollowInHeader={ true }>
				<DocumentHead title={ this.translate( '%s ‹ Reader', { args: title } ) } />
			</Stream>
		);
	}

} );

module.exports = LikedStream;
