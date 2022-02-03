import AsyncLoad from 'calypso/components/async-load';
import useSearchQueryState from 'calypso/lib/url-search-query-state';

function SupportArticleDialogLoader() {
	const [ searchQueryStateValue ] = useSearchQueryState( 'support-article' );

	return (
		!! searchQueryStateValue && (
			<AsyncLoad require="calypso/blocks/support-article-dialog/dialog" placeholder={ null } />
		)
	);
}

export default SupportArticleDialogLoader;
