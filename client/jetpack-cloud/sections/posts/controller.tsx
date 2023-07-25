import Posts from 'calypso/my-sites/posts/main';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export function posts( context, next ) {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	const author = context.params.author === 'my' ? getCurrentUserId( state ) : null;
	let search = context.query.s || '';
	const category = context.query.category;
	const tag = context.query.tag;

	if ( ! siteId ) {
		search = '';
	}

	context.primary = createElement( Posts, {
		context,
		author,
		statusSlug: context.params.status,
		search,
		category,
		tag,
	} );

	next();
}
