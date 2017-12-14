/** @format */

/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { get, head, isEmpty, map } from 'lodash';

/**
 * Internal dependencies
 */
import EditorRevisionsListHeader from './header';
import EditorRevisionsListItem from './item';
import { selectPostRevision } from 'state/posts/revisions/actions';
import KeyboardShortcuts from 'lib/keyboard-shortcuts';

class EditorRevisionsList extends PureComponent {
	static propTypes = {
		comparisons: PropTypes.object,
		postId: PropTypes.number,
		siteId: PropTypes.number,
		revisions: PropTypes.array.isRequired,
		selectedRevisionId: PropTypes.number,
	};

	selectRevision = revisionId => {
		this.props.selectPostRevision( revisionId );
	};

	trySelectingFirstRevision = () => {
		const { revisions } = this.props;
		if ( ! revisions.length ) {
			return;
		}
		const firstRevision = head( revisions );
		if ( ! firstRevision.id ) {
			return;
		}
		this.selectRevision( firstRevision.id );
	};

	componentDidMount() {
		// Make sure that scroll position in the editor is not preserved.
		window.scrollTo( 0, 0 );

		KeyboardShortcuts.on( 'move-selection-up', this.selectNextRevision );
		KeyboardShortcuts.on( 'move-selection-down', this.selectPreviousRevision );

		if ( ! this.props.selectedRevisionId ) {
			this.trySelectingFirstRevision();
		}
	}

	componentWillUnmount() {
		KeyboardShortcuts.off( 'move-selection-up', this.selectNextRevision );
		KeyboardShortcuts.off( 'move-selection-down', this.selectPreviousRevision );
	}

	componentDidUpdate( prevProps ) {
		if ( ! this.props.selectedRevisionId ) {
			this.trySelectingFirstRevision();
		}
		if ( this.props.selectedRevisionId !== prevProps.selectedRevisionId ) {
			this.scrollToSelectedItem();
		}
	}

	scrollToSelectedItem() {
		const thisNode = ReactDom.findDOMNode( this );
		const scrollerNode = thisNode.querySelector( '.editor-revisions-list__scroller' );
		const selectedNode = thisNode.querySelector( '.editor-revisions-list__revision.is-selected' );
		const listNode = thisNode.querySelector( '.editor-revisions-list__list' );
		if ( ! ( scrollerNode && selectedNode && listNode ) ) {
			return;
		}
		const { bottom: selectedBottom, top: selectedTop } = selectedNode.getBoundingClientRect();
		const { top: listTop } = listNode.getBoundingClientRect();
		const {
			bottom: scrollerBottom,
			height: scrollerHeight,
			top: scrollerTop,
		} = scrollerNode.getBoundingClientRect();

		const isAboveBounds = selectedTop < scrollerTop;
		const isBelowBounds = selectedBottom > scrollerBottom;

		const targetWhenAbove = selectedTop - listTop;
		const targetWhenBelow = Math.abs( scrollerHeight - ( selectedBottom - listTop ) );

		isAboveBounds && scrollerNode.scrollTo( 0, targetWhenAbove );
		isBelowBounds && scrollerNode.scrollTo( 0, targetWhenBelow );
	}

	selectNextRevision = () => {
		const { nextRevisionId } = this.props;
		nextRevisionId && this.selectRevision( nextRevisionId );
	};

	selectPreviousRevision = () => {
		const { prevRevisionId } = this.props;
		prevRevisionId && this.selectRevision( prevRevisionId );
	};

	render() {
		const { comparisons, postId, revisions, selectedRevisionId, siteId } = this.props;
		const classes = classNames( 'editor-revisions-list', {
			'is-loading': isEmpty( revisions ),
		} );

		return (
			<div className={ classes }>
				<EditorRevisionsListHeader numRevisions={ revisions.length } />
				<div className="editor-revisions-list__scroller">
					<ul className="editor-revisions-list__list">
						{ map( revisions, revision => {
							const itemClasses = classNames( 'editor-revisions-list__revision', {
								'is-selected': revision.id === selectedRevisionId,
							} );
							const revisionChanges = get( comparisons, [ revision.id, 'diff', 'totals' ], {} );
							return (
								<li className={ itemClasses } key={ revision.id }>
									<EditorRevisionsListItem
										postId={ postId }
										revision={ revision }
										revisionChanges={ revisionChanges }
										siteId={ siteId }
									/>
								</li>
							);
						} ) }
					</ul>
				</div>
			</div>
		);
	}
}

export default connect(
	( state, { comparisons, selectedRevisionId } ) => {
		const { nextRevisionId, prevRevisionId } = get( comparisons, [ selectedRevisionId ], {} );
		return {
			nextRevisionId,
			prevRevisionId,
		};
	},
	{ selectPostRevision }
)( EditorRevisionsList );
