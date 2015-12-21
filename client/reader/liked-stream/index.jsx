// External dependencies
import React from 'react' ;

// Internal dependencies
import FollowingStream from 'reader/following-stream';
import EmptyContent from './empty' ;

const LikedStream = React.createClass( {

	render: function() {
		var title = this.translate( 'My Likes' ),
			emptyContent = ( <EmptyContent /> );

		if ( this.props.setPageTitle ) {
			this.props.setPageTitle( title );
		}
		return (
			<FollowingStream { ...this.props } containerClass={ "my-likes__posts" } listName={ title } emptyContent={ emptyContent } showFollowInHeader={ true } />
		);
	}

} );

module.exports = LikedStream;
