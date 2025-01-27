import scrollTo from 'calypso/lib/scroll-to';

interface ScrollToCommentsOptions {
	onScrollComplete?: () => void;
	focusTextArea?: boolean;
	container?: HTMLElement;
}

export const scrollToComments = ( {
	onScrollComplete,
	focusTextArea = false,
	container,
}: ScrollToCommentsOptions = {} ) => {
	const commentsNode = document.querySelector( '.reader-full-post__comments-wrapper' );
	const commentTextarea = document.querySelector( '.form-textarea' );

	if ( ! commentsNode || ! ( commentsNode instanceof HTMLElement ) ) {
		return;
	}

	// Create a promise that resolves when scrolling ends
	const scrollPromise = new Promise< void >( ( resolve ) => {
		scrollTo( {
			x: 0,
			container,
			y: commentsNode.offsetTop - 48,
			duration: 300,
			onComplete: () => {
				// Check if the comment node moved during scroll and adjust
				if ( commentsNode instanceof HTMLElement && commentsNode.offsetTop ) {
					window.scrollTo( 0, commentsNode.offsetTop - 48 );
				}
				resolve();
			},
		} );
	} );

	// Handle post-scroll actions
	scrollPromise.then( () => {
		if ( focusTextArea && commentTextarea instanceof HTMLTextAreaElement ) {
			commentTextarea.focus();
		}
		onScrollComplete?.();
	} );

	return scrollPromise;
};
