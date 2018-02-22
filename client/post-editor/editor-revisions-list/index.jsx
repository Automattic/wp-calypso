/** @format */

/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { filter, forEach, get, head, isEmpty, last, map, pickBy } from 'lodash';

/**
 * Internal dependencies
 */
import EditorRevisionsListHeader from './header';
import EditorRevisionsListNavigation from './navigation';
import EditorRevisionsListItem from './item';
import { selectPostRevision } from 'state/posts/revisions/actions';
import KeyboardShortcuts from 'lib/keyboard-shortcuts';

class EditorRevisionsList extends PureComponent {
	static propTypes = {
		postId: PropTypes.number,
		siteId: PropTypes.number,
		revisions: PropTypes.array.isRequired,
		filteredRevisions: PropTypes.array.isRequired,
		comparisons: PropTypes.object,
		filteredComparisons: PropTypes.object,
		selectedRevisionId: PropTypes.number,
		nextIsDisabled: PropTypes.bool,
		prevIsDisabled: PropTypes.bool,
	};

	selectRevision = revisionId => {
		this.props.selectPostRevision( revisionId );
	};

	trySelectingLatestRevision = () => {
		const { latestRevisionId } = this.props;
		if ( ! latestRevisionId ) {
			return;
		}
		this.selectRevision( latestRevisionId );
	};

	componentDidMount() {
		// Make sure that scroll position in the editor is not preserved.
		window.scrollTo( 0, 0 );

		KeyboardShortcuts.on( 'move-selection-up', this.selectNextRevision );
		KeyboardShortcuts.on( 'move-selection-down', this.selectPreviousRevision );

		if ( ! this.props.selectedRevisionId ) {
			this.trySelectingLatestRevision();
		}
	}

	componentWillUnmount() {
		KeyboardShortcuts.off( 'move-selection-up', this.selectNextRevision );
		KeyboardShortcuts.off( 'move-selection-down', this.selectPreviousRevision );
	}

	componentDidUpdate( prevProps ) {
		if ( ! this.props.selectedRevisionId ) {
			this.trySelectingLatestRevision();
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
		const {
			top: selectedTop,
			right: selectedRight,
			bottom: selectedBottom,
			left: selectedLeft,
		} = selectedNode.getBoundingClientRect();
		const {
			top: listTop,
			left: listLeft,
			width: listWidth,
			height: listHeight,
		} = listNode.getBoundingClientRect();
		const {
			top: scrollerTop,
			bottom: scrollerBottom,
			height: scrollerHeight,
			left: scrollerLeft,
			right: scrollerRight,
			width: scrollerWidth,
		} = scrollerNode.getBoundingClientRect();

		if ( listWidth > listHeight ) {
			const isLeftOfBounds = selectedLeft < scrollerLeft;
			const isRightOfBounds = selectedRight > scrollerRight;

			const targetWhenLeft = selectedLeft - listLeft;
			const targetWhenRight = Math.abs( scrollerWidth - ( selectedRight - listLeft ) );

			if ( isLeftOfBounds || isRightOfBounds ) {
				scrollerNode.scrollLeft = isLeftOfBounds ? targetWhenLeft : targetWhenRight;
			}
		} else {
			const isAboveBounds = selectedTop < scrollerTop;
			const isBelowBounds = selectedBottom > scrollerBottom;

			const targetWhenAbove = selectedTop - listTop;
			const targetWhenBelow = Math.abs( scrollerHeight - ( selectedBottom - listTop ) );

			if ( isAboveBounds || isBelowBounds ) {
				scrollerNode.scrollTop = isAboveBounds ? targetWhenAbove : targetWhenBelow;
			}
		}
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
		const {
			filteredRevisions,
			filteredComparisons,
			nextIsDisabled,
			prevIsDisabled,
			postId,
			selectedRevisionId,
			siteId,
		} = this.props;
		const classes = classNames( 'editor-revisions-list', {
			'is-loading': isEmpty( filteredRevisions ),
		} );

		return (
			<div className={ classes }>
				<EditorRevisionsListHeader numRevisions={ filteredRevisions.length } />
				<EditorRevisionsListNavigation
					nextIsDisabled={ nextIsDisabled }
					prevIsDisabled={ prevIsDisabled }
					selectNextRevision={ this.selectNextRevision }
					selectPreviousRevision={ this.selectPreviousRevision }
				/>
				<div className="editor-revisions-list__scroller">
					<ul className="editor-revisions-list__list">
						{ map( filteredRevisions, revision => {
							const itemClasses = classNames( 'editor-revisions-list__revision', {
								'is-selected': revision.id === selectedRevisionId,
							} );
							const revisionChanges = get(
								filteredComparisons,
								[ revision.id, 'diff', 'totals' ],
								{}
							);
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

const minWords = 4;

const filterRevisions = ( revisions, comparisons ) => {
	return filter( revisions, revision => {
		const { add, del } = get( comparisons, [ revision.id, 'diff', 'totals' ], { add: 0, del: 0 } );
		return add > minWords || del > minWords;
	} );
};

const filterComparisons = ( comparisons, filteredRevisions ) => {
	const filteredComparisons = pickBy( comparisons, comparison => {
		const { add, del } = get( comparison, [ 'diff', 'totals' ], { add: 0, del: 0 } );
		return add > minWords || del > minWords;
	} );

	forEach( filteredRevisions, ( revision, i ) => {
		if ( ! revision.id ) {
			return;
		}
		filteredComparisons[ revision.id ].nextRevisionId = get(
			filteredRevisions,
			[ i - 1, 'id' ],
			null
		);
		filteredComparisons[ revision.id ].prevRevisionId = get(
			filteredRevisions,
			[ i + 1, 'id' ],
			null
		);
	} );

	return filteredComparisons;
};

export default connect(
	( state, { comparisons, revisions, selectedRevisionId } ) => {
		const filteredRevisions = filterRevisions( revisions, comparisons );
		const filteredComparisons = filterComparisons( comparisons, filteredRevisions );
		const { nextRevisionId, prevRevisionId } = get(
			filteredComparisons,
			[ selectedRevisionId ],
			{}
		);
		const latestRevisionId = get( head( filteredRevisions ), 'id' );
		const latestRevisionIsSelected = latestRevisionId === selectedRevisionId;
		const earliestRevisionIsSelected =
			! latestRevisionIsSelected && get( last( filteredRevisions ), 'id' ) === selectedRevisionId;
		const nextIsDisabled = latestRevisionIsSelected || filteredRevisions.length === 1;
		const prevIsDisabled = earliestRevisionIsSelected || filteredRevisions.length === 1;

		return {
			filteredRevisions,
			filteredComparisons,
			latestRevisionId,
			prevIsDisabled,
			nextIsDisabled,
			nextRevisionId,
			prevRevisionId,
		};
	},
	{ selectPostRevision }
)( EditorRevisionsList );
