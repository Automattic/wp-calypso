/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';

/**
 * Internal Dependencies
 */
import EditorSlug from 'post-editor/editor-slug';
import Gridicon from 'components/gridicon';

export default class PostEditorPageSlug extends Component {
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
