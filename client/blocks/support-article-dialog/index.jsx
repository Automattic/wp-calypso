import { connect } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import { hasUrlSearchQuery } from 'calypso/lib/url-search-query-state';
import isInlineSupportArticleVisible from 'calypso/state/selectors/is-inline-support-article-visible';

function SupportArticleDialogLoader( { isVisible } ) {
	if ( isVisible === false ) {
		isVisible = hasUrlSearchQuery( 'support-article' );
	}

	return (
		isVisible && (
			<AsyncLoad require="calypso/blocks/support-article-dialog/dialog" placeholder={ null } />
		)
	);
}

export default connect( ( state ) => ( {
	isVisible: isInlineSupportArticleVisible( state ),
} ) )( SupportArticleDialogLoader );
