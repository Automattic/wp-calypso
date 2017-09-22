/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import EditorSlug from 'post-editor/editor-slug';

export default class PostEditorPageSlug extends PureComponent {
	static propTypes = {
		path: PropTypes.string
	};

	render() {
		return (
			<EditorSlug path={ this.props.path } instanceName="page-permalink">
				<Gridicon icon="link" />
			</EditorSlug>
		);
	}
}
