/** @format */

/**
 * External dependencies
 */

import React, { PureComponent } from 'react';
import ReactDom from 'react-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getPostRevisionChanges } from 'state/selectors';
import EditorDiffChanges from './changes';

class EditorDiffViewer extends PureComponent {
	static propTypes = {
		postId: PropTypes.number.isRequired,
		selectedRevisionId: PropTypes.number,
		siteId: PropTypes.number.isRequired,

		// connected
		revisionChanges: PropTypes.shape( {
			title: PropTypes.array,
			content: PropTypes.array,
		} ).isRequired,
	};

	scrollToFirstChangeOrTop = () => {
		const thisNode = ReactDom.findDOMNode( this );
		const diffNode = thisNode.querySelector(
			'.editor-diff-viewer__additions, .editor-diff-viewer__deletions'
		);
		const thisNodeHeight = get( thisNode, 'offsetHeight', 0 );
		const offset = Math.max( 0, get( diffNode, 'offsetTop', 0 ) - thisNodeHeight / 2 );
		thisNode.scrollTo( 0, offset );
	};

	componentDidMount() {
		this.scrollToFirstChangeOrTop();
	}

	componentDidUpdate() {
		this.scrollToFirstChangeOrTop();
	}

	render() {
		const { revisionChanges } = this.props;
		return (
			<div className="editor-diff-viewer">
				<h1 className="editor-diff-viewer__title">
					<EditorDiffChanges changes={ revisionChanges.title } />
				</h1>
				<pre className="editor-diff-viewer__content">
					<EditorDiffChanges changes={ revisionChanges.content } />
				</pre>
			</div>
		);
	}
}

export default connect( ( state, { siteId, postId, selectedRevisionId } ) => ( {
	revisionChanges: getPostRevisionChanges( state, siteId, postId, selectedRevisionId ),
} ) )( EditorDiffViewer );
