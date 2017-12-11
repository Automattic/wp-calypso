/** @format */

/**
 * External dependencies
 */

import React, { PureComponent } from 'react';
import ReactDom from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { get, has } from 'lodash';

/**
 * Internal dependencies
 */
import { getPostRevision } from 'state/selectors';
import EditorDiffChanges from './changes';

class EditorDiffViewer extends PureComponent {
	static propTypes = {
		postId: PropTypes.number.isRequired,
		selectedRevisionId: PropTypes.number,
		siteId: PropTypes.number.isRequired,
		diff: PropTypes.shape( {
			post_content: PropTypes.array,
			post_title: PropTypes.array,
			totals: PropTypes.object,
		} ).isRequired,
	};

	scrollToFirstChangeOrTop = () => {
		const thisNode = ReactDom.findDOMNode( this );
		const diffNode = thisNode.querySelector(
			'.editor-diff-viewer__additions, .editor-diff-viewer__deletions'
		);
		const thisNodeHeight = get( thisNode, 'offsetHeight', 0 );
		const offset = Math.max( 0, get( diffNode, 'offsetTop', 0 ) - thisNodeHeight / 2 );
		thisNode.scrollTop = offset;
	};

	componentDidMount() {
		this.scrollToFirstChangeOrTop();
	}

	componentDidUpdate() {
		this.scrollToFirstChangeOrTop();
	}

	render() {
		const { diff } = this.props;
		const classes = classNames( 'editor-diff-viewer', {
			'is-loading': ! has( diff, 'post_content' ) && ! has( diff, 'post_title' ),
		} );

		return (
			<div className={ classes }>
				<h1 className="editor-diff-viewer__title">
					<EditorDiffChanges changes={ diff.post_title } />
				</h1>
				<pre className="editor-diff-viewer__content">
					<EditorDiffChanges changes={ diff.post_content } splitLines />
				</pre>
			</div>
		);
	}
}

export default connect( ( state, { siteId, postId, selectedRevisionId } ) => ( {
	revision: getPostRevision( state, siteId, postId, selectedRevisionId, 'display' ),
} ) )( EditorDiffViewer );
