/** @format */

/**
 * External dependencies
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { get, has, map, filter, first, last, debounce, partial } from 'lodash';

/**
 * Internal dependencies
 */
import { getPostRevision } from 'state/selectors';
import TextDiff from 'components/text-diff';
// import EditorDiffChanges from './changes';
import Button from 'components/button';
import scrollTo from 'lib/scroll-to';

const getCenterOffset = node => get( node, 'offsetTop', 0 ) + get( node, 'offsetHeight', 0 ) / 2;

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

	state = {
		changeOffsets: [],
		scrollTop: 0,
		viewportHeight: 0,
	};

	lastScolledRevisionId = null;

	tryScrollingToFirstChangeOrTop = () => {
		if (
			! this.props.selectedRevisionId ||
			this.props.selectedRevisionId === this.lastScolledRevisionId
		) {
			return;
		}

		// save revisionId so we don't scroll again, unless it changes
		this.lastScolledRevisionId = this.props.selectedRevisionId;

		this.recomputeChanges( () => {
			this.centerScrollingOnOffset( this.state.changeOffsets[ 0 ] || 0, false );
		} );
	};

	recomputeChanges = callback => {
		const diffNodes = this.node.querySelectorAll(
			'.editor-diff-viewer__additions, .editor-diff-viewer__deletions'
		);
		this.setState(
			{
				changeOffsets: map( diffNodes, getCenterOffset ),
				viewportHeight: get( this.node, 'offsetHeight', 0 ),
				scrollTop: get( this.node, 'scrollTop', 0 ),
			},
			callback
		);
	};

	debouncedRecomputeChanges = debounce( partial( this.recomputeChanges, null ), 1000 );

	centerScrollingOnOffset = ( offset, animated = true ) => {
		const nextScrollTop = Math.max( 0, offset - this.state.viewportHeight / 2 );

		if ( ! animated ) {
			this.node.scrollTop = nextScrollTop;
			return;
		}

		scrollTo( {
			container: this.node,
			x: 0,
			y: nextScrollTop,
		} );
	};

	handleScroll = e => {
		this.setState( {
			scrollTop: get( e.target, 'scrollTop', 0 ),
		} );
	};

	componentDidMount() {
		this.tryScrollingToFirstChangeOrTop();
		if ( typeof window !== undefined ) {
			window.addEventListener( 'resize', this.debouncedRecomputeChanges );
		}
	}

	componentWillUnmount() {
		window.removeEventListener( 'resize', this.debouncedRecomputeChanges );
	}

	handleScrollableNode = node => {
		this.node = node;
		if ( this.node ) {
			this.node.addEventListener( 'scroll', this.handleScroll );
		} else {
			this.node.removeEventListener( 'scroll', this.handleScroll );
		}
	};

	componentDidUpdate() {
		this.tryScrollingToFirstChangeOrTop();
	}

	scrollAbove = () => {
		this.centerScrollingOnOffset( last( this.changesAboveViewport ) );
	};

	scrollBelow = () => {
		this.centerScrollingOnOffset( first( this.changesBelowViewport ) );
	};

	render() {
		const { diff } = this.props;
		const classes = classNames( 'editor-diff-viewer', {
			'is-loading': ! has( diff, 'post_content' ) && ! has( diff, 'post_title' ),
		} );

		const bottomBoundary = this.state.scrollTop + this.state.viewportHeight;

		// saving to this to we can access if from `scrollAbove` and `scrollBelow`
		this.changesAboveViewport = filter(
			this.state.changeOffsets,
			offset => offset < this.state.scrollTop
		);
		this.changesBelowViewport = filter(
			this.state.changeOffsets,
			offset => offset > bottomBoundary
		);

		return (
			<div className={ classes }>
				<div className="editor-diff-viewer__scrollable" ref={ this.handleScrollableNode }>
					<h1 className="editor-diff-viewer__title">
						<TextDiff operations={ diff.post_title } />
					</h1>
					<pre className="editor-diff-viewer__content">
						<TextDiff operations={ diff.post_content } splitLines />
					</pre>
				</div>
				{ this.changesAboveViewport.length > 0 && (
					<Button className="editor-diff-viewer__hint-above" onClick={ this.scrollAbove }>
						{ this.changesAboveViewport.length } changes above
					</Button>
				) }
				{ this.changesBelowViewport.length > 0 && (
					<Button className="editor-diff-viewer__hint-below" onClick={ this.scrollBelow }>
						{ this.changesBelowViewport.length } changes below
					</Button>
				) }
			</div>
		);
	}
}

export default connect( ( state, { siteId, postId, selectedRevisionId } ) => ( {
	revision: getPostRevision( state, siteId, postId, selectedRevisionId, 'display' ),
} ) )( EditorDiffViewer );
