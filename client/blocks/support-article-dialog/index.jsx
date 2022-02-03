import AsyncLoad from 'calypso/components/async-load';
import { useHasUrlSearchQuery } from 'calypso/lib/url-search-query-state';

function SupportArticleDialogLoader() {
	const hasQueryInUrl = useHasUrlSearchQuery( 'support-article' );
	return (
		hasQueryInUrl && (
			<AsyncLoad require="calypso/blocks/support-article-dialog/dialog" placeholder={ null } />
		)
	);
}

export default SupportArticleDialogLoader;
