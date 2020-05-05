/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import Gridicon from 'components/gridicon';

/**
 * Internal Dependencies
 */
import EditorSlug from 'post-editor/editor-slug';
import * as utils from 'state/posts/utils';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPost } from 'state/posts/selectors';
import { getSite } from 'state/sites/selectors';

class EditorPageSlug extends PureComponent {
	static propTypes = {
		isDisplayed: PropTypes.bool,
		path: PropTypes.string,
	};

	render() {
		if ( ! this.props.isDisplayed ) {
			return null;
		}

		return (
			<EditorSlug path={ this.props.path } instanceName="page-permalink">
				<Gridicon icon="link" />
			</EditorSlug>
		);
	}
}

// Determine the page base path, i.e., without the last component.
// Don't remove components beyond the site URL.
// TODO: merge with utils.getPagePath and add unit tests for the site URL behavior.
function getPagePath( site, post ) {
	const siteURL = site ? site.URL + '/' : null;
	if ( post && post.URL && post.URL !== siteURL ) {
		return utils.getPagePath( post );
	}

	return siteURL;
}

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const postId = getEditorPostId( state );
	const site = getSite( state, siteId );
	const post = getEditedPost( state, siteId, postId );

	// display only when both site and post are available (i.e., not null) and the post is a page
	const isDisplayed = siteId && utils.isPage( post );
	const path = getPagePath( site, post );

	return { isDisplayed, path };
} )( EditorPageSlug );
