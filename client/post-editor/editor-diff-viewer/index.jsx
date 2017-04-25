/**
 * External dependencies
 */
import React, { PureComponent, PropTypes } from 'react';

class EditorDiffViewer extends PureComponent {
	render() {
		return (
			<div>
				I'm a diff viewer<br />
				postId: { this.props.postId }<br />
				revisionId: { this.props.revisionId }<br />
				siteId: { this.props.siteId }<br />
			</div>
		);
	}
}

EditorDiffViewer.propTypes = {
	postId: PropTypes.number,
	revisionId: PropTypes.number,
	siteId: PropTypes.number,
};

export default EditorDiffViewer;
