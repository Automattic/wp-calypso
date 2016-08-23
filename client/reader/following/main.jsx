/**
 * External dependencies
 */
import React from 'react';
import config from 'config';

/**
 * Internal dependencies
 */
import Stream from 'reader/stream';
import ReaderPostCard from 'blocks/reader-post-card';

class ReaderPostCardAdapter extends React.Component {

	constructor( props ) {
		super( props );
		[ 'onCommentClick', 'onClick' ].forEach( method => {
			this[ method ] = this[ method ].bind( this );
		} );
	}

	onClick() {
		this.props.handleClick && this.props.handleClick( this.props.post );
	}

	onCommentClick() {
		this.props.handleClick && this.props.handleClick( this.props.post, { comments: true } );
	}

	// take what the stream hands to a card and adapt it
	// for use by a ReaderPostCard
	render() {
		return ( <ReaderPostCard
			post={ this.props.post }
			site={ null }
			feed={ null }
			onClick={ this.onClick }
			onCommentClick={ this.onCommentClick }
		/> );
	}
}

function refreshCardFactory( /* post */ ) {
	// should look at the post and determine class to return.
	// blocked posts should show a block card, x-posts an x-post card
	return ReaderPostCardAdapter;
}

const FollowingStream = ( props ) => {
	let cardFactory = null;
	if ( config.isEnabled( 'reader/refresh-2016-07' ) ) {
		cardFactory = refreshCardFactory;
	}
	return (
		<Stream cardFactory={ cardFactory } { ...props } />
	);
};

export default FollowingStream;
