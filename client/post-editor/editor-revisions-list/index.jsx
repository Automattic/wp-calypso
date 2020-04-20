/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { get, head, isEmpty, last, map } from 'lodash';

/**
 * Internal dependencies
 */
import EditorRevisionsListHeader from './header';
import EditorRevisionsListViewButtons from './view-buttons';
import EditorRevisionsListNavigation from './navigation';
import EditorRevisionsListItem from './item';
import { selectPostRevision } from 'state/posts/revisions/actions';
import KeyboardShortcuts from 'lib/keyboard-shortcuts';

/**
 * Style dependencies
 */
import './style.scss';

class EditorRevisionsList extends PureComponent {
	static propTypes = {
		comparisons: PropTypes.object,
		postId: PropTypes.number,
		siteId: PropTypes.number,
		revisions: PropTypes.array.isRequired,
		selectedRevisionId: PropTypes.number,
		nextIsDisabled: PropTypes.bool,
		prevIsDisabled: PropTypes.bool,
	};

	selectRevision = ( revisionId ) => {
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
			comparisons,
			nextIsDisabled,
			prevIsDisabled,
			postId,
			revisions,
			selectedRevisionId,
			siteId,
		} = this.props;
		const classes = classNames( 'editor-revisions-list', {
			'is-loading': isEmpty( revisions ),
		} );

		return (
			<div className={ classes }>
				<EditorRevisionsListHeader numRevisions={ revisions.length } />
				<EditorRevisionsListViewButtons />
				<EditorRevisionsListNavigation
					nextIsDisabled={ nextIsDisabled }
					prevIsDisabled={ prevIsDisabled }
					selectNextRevision={ this.selectNextRevision }
					selectPreviousRevision={ this.selectPreviousRevision }
				/>
				<div className="editor-revisions-list__scroller">
					<ul className="editor-revisions-list__list">
						{ map( revisions, ( revision ) => {
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
	( state, { comparisons, revisions, selectedRevisionId } ) => {
		const { nextRevisionId, prevRevisionId } = get( comparisons, [ selectedRevisionId ], {} );
		const latestRevisionId = get( head( revisions ), 'id' );
		const latestRevisionIsSelected = latestRevisionId === selectedRevisionId;
		const earliestRevisionIsSelected =
			! latestRevisionIsSelected && get( last( revisions ), 'id' ) === selectedRevisionId;
		const nextIsDisabled = latestRevisionIsSelected || revisions.length === 1;
		const prevIsDisabled = earliestRevisionIsSelected || revisions.length === 1;

		return {
			latestRevisionId,
			prevIsDisabled,
			nextIsDisabled,
			nextRevisionId,
			prevRevisionId,
		};
	},
	{ selectPostRevision }
)( EditorRevisionsList );
