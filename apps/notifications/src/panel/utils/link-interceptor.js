const openLink = ( href, tracksEvent ) => ( { type: 'OPEN_LINK', href, tracksEvent } );
const openSite = ( { siteId, href } ) => ( { type: 'OPEN_SITE', siteId, href } );
const openPost = ( siteId, postId, href ) => ( { type: 'OPEN_POST', siteId, postId, href } );
const openComment = ( { siteId, postId, href, commentId } ) => ( {
	type: 'OPEN_COMMENT',
	siteId,
	postId,
	href,
	commentId,
} );

export const interceptLinks = ( event ) => ( dispatch ) => {
	const { target } = event;

	if ( 'A' !== target.tagName && 'A' !== target.parentNode.tagName ) {
		return;
	}

	const node = 'A' === target.tagName ? target : target.parentNode;
	const { dataset = {}, href } = node;
	const { linkType, postId, siteId, commentId, tracksEvent } = dataset;

	if ( ! linkType ) {
		return;
	}

	// we don't want to interfere with the click
	// if the user has specifically overwritten the
	// normal behavior already by holding down
	// one of the modifier keys.
	if ( event.ctrlKey || event.metaKey ) {
		return;
	}

	event.stopPropagation();
	event.preventDefault();

	if ( 'post' === linkType ) {
		dispatch( openPost( siteId, postId, href ) );
	} else if ( 'comment' === linkType ) {
		dispatch( openComment( { siteId, postId, href, commentId } ) );
	} else if ( 'site' === linkType ) {
		dispatch( openSite( { siteId, href } ) );
	} else {
		dispatch( openLink( href, tracksEvent ) );
	}
};
