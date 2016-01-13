var React = require( 'react' );

var FollowingStream = require( 'reader/following-stream' ),
	EmptyContent = require( './empty' );

var LikedStream = React.createClass( {

	render: function() {
		var title = this.translate( 'My Likes' ),
			emptyContent = ( <EmptyContent /> );

		if ( this.props.setPageTitle ) {
			this.props.setPageTitle( title );
		}
		return (
			<FollowingStream { ...this.props } listName={ title } emptyContent={ emptyContent } showFollowInHeader={ true } />
		);
	}

} );

module.exports = LikedStream;
