/** @format */

/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { findIndex, get, head, map } from 'lodash';

/**
 * Internal dependencies
 */
import EditorRevisionsListHeader from './header';
import EditorRevisionsListItem from './item';
import { selectPostRevision } from 'state/posts/revisions/actions';
import { getPostRevision, getPostRevisionsSelectedRevisionId } from 'state/selectors';
import KeyboardShortcuts from 'lib/keyboard-shortcuts';
import LoadButton from './load-button';

class EditorRevisionsList extends PureComponent {
	static propTypes = {
		postId: PropTypes.number,
		siteId: PropTypes.number,
		revisions: PropTypes.array.isRequired,
		selectedRevisionId: PropTypes.number,
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
		this.props.selectPostRevision( firstRevision.id );
	};

	componentWillReceiveProps( { selectedRevisionId } ) {
		if ( ! selectedRevisionId || ! this.props.selectedRevisionId ) {
			this.trySelectingFirstRevision();
		}
	}

	componentDidMount() {
		// Make sure that scroll position in the editor is not preserved.
		window.scrollTo( 0, 0 );

		KeyboardShortcuts.on( 'move-selection-up', this.selectNextRevision );
		KeyboardShortcuts.on( 'move-selection-down', this.selectPreviousRevision );
	}

	componentWillUnmount() {
		KeyboardShortcuts.off( 'move-selection-up', this.selectNextRevision );
		KeyboardShortcuts.off( 'move-selection-down', this.selectPreviousRevision );
	}

	selectNextRevision = () => {
		const { nextRevisionId } = this.props;
		nextRevisionId && this.props.selectPostRevision( nextRevisionId );
	};

	selectPreviousRevision = () => {
		const { prevRevisionId } = this.props;
		prevRevisionId && this.props.selectPostRevision( prevRevisionId );
	};

	render() {
		const { postId, revisions, selectedRevisionId, siteId } = this.props;
		return (
			<div className="editor-revisions-list">
				<EditorRevisionsListHeader numRevisions={ revisions.length } />
				<div className="editor-revisions-list__scroller">
					<ul className="editor-revisions-list__list">
						{ map( revisions, revision => {
							const itemClasses = classNames( 'editor-revisions-list__revision', {
								'is-selected': revision.id === selectedRevisionId,
							} );
							return (
								<li className={ itemClasses } key={ revision.id }>
									<EditorRevisionsListItem revision={ revision } />
								</li>
							);
						} ) }
					</ul>
				</div>
				<LoadButton postId={ postId } selectedRevisionId={ selectedRevisionId } siteId={ siteId } />
			</div>
		);
	}
}

export default connect(
	( state, { revisions } ) => {
		const selectedRevisionId = getPostRevisionsSelectedRevisionId( state );
		const selectedIdIndex = findIndex( revisions, { id: selectedRevisionId } );
		const nextRevisionId = selectedRevisionId && get( revisions, [ selectedIdIndex - 1, 'id' ] );
		const prevRevisionId = selectedRevisionId && get( revisions, [ selectedIdIndex + 1, 'id' ] );

		return {
			selectedRevision: getPostRevision( state, selectedRevisionId ),
			nextRevisionId,
			prevRevisionId,
			selectedRevisionId,
		};
	},
	{ selectPostRevision }
)( EditorRevisionsList );
