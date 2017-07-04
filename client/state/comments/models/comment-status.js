export function CommentStatus( constructor, name ) {
	Object.defineProperty( this, 'constructor', {
		value: constructor || this
	} );

	this.name = name;
}

export function Approved() {
	return new CommentStatus( Approved, 'approved' );
}

export function Pending() {
	return new CommentStatus( Pending, 'pending' );
}

export function Spam() {
	return new CommentStatus( Spam, 'spam' );
}

export function Trash() {
	return new CommentStatus( Trash, 'trash' );
}
