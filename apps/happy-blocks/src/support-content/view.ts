export function getRelativeDate( date: string ): string {
	// window.moment is exposed as a dependency of `wp.date`
	const moment: any = window[ 'moment' as any ];

	return moment( date ).fromNow();
}

export function updateForumTopicDate( blockRoot: HTMLElement ) {
	const dateElement = blockRoot.querySelector( '.hb-support-page-embed__created' );
	const relativeDateElement = blockRoot.querySelector( '.hb-support-page-embed__relative-created' );

	if ( dateElement?.textContent && relativeDateElement ) {
		relativeDateElement.textContent = getRelativeDate( dateElement.textContent );
	}
}
