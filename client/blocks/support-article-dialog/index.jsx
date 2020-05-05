/**
 * External Dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import AsyncLoad from 'components/async-load';
import isInlineSupportArticleVisible from 'state/selectors/is-inline-support-article-visible';

function SupportArticleDialogLoader( { isVisible } ) {
	return (
		isVisible && <AsyncLoad require="blocks/support-article-dialog/dialog" placeholder={ null } />
	);
}

export default connect( ( state ) => ( {
	isVisible: isInlineSupportArticleVisible( state ),
} ) )( SupportArticleDialogLoader );
