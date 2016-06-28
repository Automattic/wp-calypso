var React = require( 'react' );

var Stream = require( 'reader/stream' ),
	EmptyContent = require( './empty' );

var LikedStream = React.createClass( {

	render: function() {
		var title = this.translate( 'My Likes' ),
			emptyContent = ( <EmptyContent /> );

		if ( this.props.setPageTitle ) {
			this.props.setPageTitle( title );
		}
		return (
			<Stream { ...this.props } listName={ title } emptyContent={ emptyContent } showFollowInHeader={ true } />
		);
	}

} );

module.exports = LikedStream;
