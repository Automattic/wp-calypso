export function CommentStatus( constructor ) {
	Object.defineProperty( this, 'constructor', {
		value: constructor || this
	} );
}

export function Approved() {
	return new CommentStatus( Approved );
}

export function Pending() {
	return new CommentStatus( Pending );
}

export function Spam() {
	return new CommentStatus( Spam );
}

export function Trash() {
	return new CommentStatus( Trash );
}
