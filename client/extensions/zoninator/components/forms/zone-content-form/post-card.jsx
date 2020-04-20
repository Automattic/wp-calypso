/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import SectionHeader from 'components/section-header';
import { getEditorPath } from 'state/ui/editor/selectors';
import { getPostPreviewUrl } from 'state/posts/selectors';
import { isSitePreviewable } from 'state/sites/selectors';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';
import { setPreviewUrl } from 'state/ui/preview/actions';
import { setUrlScheme } from 'lib/url';

class PostCard extends Component {
	static propTypes = {
		editorPath: PropTypes.string.isRequired,
		isPreviewable: PropTypes.bool.isRequired,
		postId: PropTypes.number.isRequired,
		postTitle: PropTypes.string.isRequired,
		previewUrl: PropTypes.string,
		siteId: PropTypes.number.isRequired,
		remove: PropTypes.func.isRequired,
		dispatch: PropTypes.func.isRequired,
	};

	handleMouseDown = ( event ) => {
		event.stopPropagation();
		event.preventDefault();
	};

	viewPost = ( event ) => {
		const { dispatch, isPreviewable, previewUrl } = this.props;

		event.preventDefault();

		if ( ! isPreviewable && typeof window === 'object' ) {
			return window.open( previewUrl );
		}

		dispatch( setPreviewUrl( setUrlScheme( previewUrl, 'https' ) ) );
		dispatch( setLayoutFocus( 'preview' ) );
	};

	render() {
		const { editorPath, postTitle, previewUrl, remove, translate } = this.props;

		const postCardClass = 'zoninator__zone-list-item';

		return (
			<SectionHeader label={ postTitle } className={ postCardClass }>
				<Button
					compact
					onMouseDown={ this.handleMouseDown }
					onClick={ this.viewPost }
					href={ previewUrl }
					draggable="false"
					target="_blank"
				>
					{ translate( 'View' ) }
				</Button>
				<Button compact onMouseDown={ this.handleMouseDown } href={ editorPath } draggable="false">
					{ translate( 'Edit' ) }
				</Button>
				<Button compact scary onMouseDown={ this.handleMouseDown } onClick={ remove }>
					{ translate( 'Remove' ) }
				</Button>
			</SectionHeader>
		);
	}
}

const connectComponent = connect( ( state, { postId, siteId } ) => ( {
	editorPath: getEditorPath( state, siteId, postId ),
	isPreviewable: !! isSitePreviewable( state, postId ),
	previewUrl: getPostPreviewUrl( state, siteId, postId ),
} ) );

export default flowRight( connectComponent, localize )( PostCard );
