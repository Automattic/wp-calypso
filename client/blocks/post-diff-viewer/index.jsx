/** @format */

/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import ReactDom from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { get, has } from 'lodash';

/**
 * Internal dependencies
 */
import TextDiff from 'components/text-diff';

class PostDiffViewer extends PureComponent {
	static propTypes = {
		diff: PropTypes.shape( {
			content: PropTypes.array,
			title: PropTypes.array,
		} ).isRequired,
	};

	scrollToFirstChangeOrTop = () => {
		const thisNode = ReactDom.findDOMNode( this );
		const diffNode = thisNode.querySelector(
			'.post-diff-viewer__additions, .post-diff-viewer__deletions'
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
		const classes = classNames( 'post-diff-viewer', {
			'is-loading': ! has( diff, 'content' ) && ! has( diff, 'title' ),
		} );

		return (
			<div className={ classes }>
				<h1 className="post-diff-viewer__title">
					<TextDiff changes={ diff.title } />
				</h1>
				<pre className="post-diff-viewer__content">
					<TextDiff changes={ diff.content } splitLines />
				</pre>
			</div>
		);
	}
}

export default PostDiffViewer;
