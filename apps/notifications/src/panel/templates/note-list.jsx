/**
 * External dependencies
 */
import ReactDOM from 'react-dom';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import { findIndex, groupBy, reduce, zip } from 'lodash';

/**
 * Internal dependencies
 */
import actions from '../state/actions';
import getFilterName from '../state/selectors/get-filter-name';
import getIsLoading from '../state/selectors/get-is-loading';
import getIsNoteHidden from '../state/selectors/get-is-note-hidden';
import getIsPanelOpen from '../state/selectors/get-is-panel-open';
import getSelectedNoteId from '../state/selectors/get-selected-note-id';

import EmptyMessage from './empty-message';
import FilterBar from './filter-bar';
import Filters from './filters';
import ListHeader from './list-header';
import Note from './note';
import Spinner from './spinner';
import StatusBar from './status-bar';
import UndoListItem from './undo-list-item';

const DAY_MILLISECONDS = 24 * 60 * 60 * 1000;

// from $wpnc__title-bar-height in boot/sizes.scss
const TITLE_OFFSET = 38;

export class NoteList extends React.Component {
	static defaultProps = {
		scrollTimeout: 200,
	};

	state = {
		undoAction: null,
		undoNote: null,
		scrollY: 0,
		scrolling: false,
		statusMessage: '',
	};

	noteElements = {};

	UNSAFE_componentWillMount() {
		this.props.global.updateStatusBar = this.updateStatusBar;
		this.props.global.resetStatusBar = this.resetStatusBar;
		this.props.global.updateUndoBar = this.updateUndoBar;
		this.props.global.resetUndoBar = this.resetUndoBar;

		if ( 'function' === typeof this.props.storeVisibilityUpdater ) {
			this.props.storeVisibilityUpdater( this.ensureSelectedNoteVisibility );
		}
	}

	componentDidMount() {
		ReactDOM.findDOMNode( this.scrollableContainer ).addEventListener( 'scroll', this.onScroll );
	}

	componentWillUnmount() {
		ReactDOM.findDOMNode( this.scrollableContainer ).removeEventListener( 'scroll', this.onScroll );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( this.props.isPanelOpen && ! nextProps.isPanelOpen ) {
			// scroll to top, from toggling frame
			this.setState( { lastSelectedIndex: 0, scrollY: 0 } );
		}
	}

	componentDidUpdate( prevProps ) {
		if ( this.noteList && ! this.props.isLoading ) {
			const element = ReactDOM.findDOMNode( this.scrollableContainer );
			if (
				element.clientHeight > 0 &&
				element.scrollTop + element.clientHeight >= this.noteList.clientHeight - 300
			) {
				this.props.client.loadMore();
			}
		}

		if ( prevProps.selectedNoteId !== this.props.selectedNoteId ) {
			this.ensureSelectedNoteVisibility();
		}
	}

	onScroll = () => {
		if ( this.isScrolling ) {
			return;
		}

		this.isScrolling = true;

		requestAnimationFrame( () => ( this.isScrolling = false ) );

		const element = ReactDOM.findDOMNode( this.scrollableContainer );
		if ( ! this.state.scrolling || this.state.scrollY !== element.scrollTop ) {
			// only set state and trigger render if something has changed
			this.setState( {
				scrolling: true,
				scrollY: element.scrollTop,
			} );
		}

		clearTimeout( this.scrollTimeout );
		this.scrollTimeout = setTimeout( this.onScrollEnd, this.props.scrollTimeout );
	};

	onScrollEnd = () => {
		this.setState( { scrolling: false } );
	};

	updateStatusBar = ( message, classList, delay ) => {
		this.setState( {
			statusClasses: classList,
			statusMessage: message,
			statusTimeout: delay,
		} );
	};

	resetStatusBar = () => {
		this.setState( {
			statusClasses: [],
			statusMessage: '',
		} );
	};

	updateUndoBar = ( action, note ) => {
		this.setState(
			{
				undoAction: action,
				undoNote: note,
			},
			() => {
				/* Jump-start the undo bar if it hasn't updated yet */
				if ( this.startUndoSequence ) {
					this.startUndoSequence();
				}
			}
		);
	};

	resetUndoBar = () => {
		this.setState( {
			undoAction: null,
			undoNote: null,
		} );
	};

	ensureSelectedNoteVisibility = () => {
		let scrollTarget = null;
		const selectedNote = this.props.selectedNote;
		const noteElement = this.noteElements[ selectedNote ];
		let listElement = null;
		let topPadding;

		if ( null === selectedNote || ! noteElement ) {
			scrollTarget = this.state.scrollY + 1;
		} else {
			/* DOM element for the list */
			listElement = this.noteList;
			topPadding = listElement.offsetTop + TITLE_OFFSET;

			const yOffset = listElement.parentNode.scrollTop;

			if ( noteElement.offsetTop - yOffset <= topPadding ) {
				/* Scroll up if note is above viewport */
				scrollTarget = noteElement.offsetTop - topPadding;
			} else if ( yOffset + this.props.height <= noteElement.offsetTop + topPadding ) {
				/* Scroll down if note is below viewport */
				scrollTarget = noteElement.offsetTop + noteElement.offsetHeight - this.props.height;
			}
		}

		if ( scrollTarget !== null && listElement ) {
			listElement.parentNode.scrollTop = scrollTarget;
		}
	};

	storeNote = ( noteId ) => ( ref ) => {
		if ( ref ) {
			this.noteElements[ noteId ] = ref;
		} else {
			delete this.noteElements[ noteId ];
		}
	};

	storeNoteList = ( ref ) => {
		this.noteList = ref;
	};

	storeScrollableContainer = ( ref ) => {
		this.scrollableContainer = ref;
	};

	storeUndoActImmediately = ( actImmediately ) => {
		this.undoActImmediately = actImmediately;
	};

	storeUndoBar = ( ref ) => {
		this.undoBar = ref;
	};

	storeUndoStartSequence = ( startSequence ) => {
		this.startUndoSequence = startSequence;
	};

	render() {
		const groupTitles = [
			this.props.translate( 'Today', {
				comment: 'heading for a list of notifications from today',
			} ),
			this.props.translate( 'Yesterday', {
				comment: 'heading for a list of notifications from yesterday',
			} ),
			this.props.translate( 'Older than 2 days', {
				comment: 'heading for a list of notifications that are more than 2 days old',
			} ),
			this.props.translate( 'Older than a week', {
				comment: 'heading for a list of notifications that are more than a week old',
			} ),
			this.props.translate( 'Older than a month', {
				comment: 'heading for a list of notifications that are more than a month old',
			} ),
		];

		// create groups of (before, after) times for grouping notes
		const now = new Date().setHours( 0, 0, 0, 0 );
		const timeBoundaries = [
			Infinity,
			now,
			new Date( now - DAY_MILLISECONDS ),
			new Date( now - DAY_MILLISECONDS * 6 ),
			new Date( now - DAY_MILLISECONDS * 30 ),
			-Infinity,
		];
		const timeGroups = zip( timeBoundaries.slice( 0, -1 ), timeBoundaries.slice( 1 ) );

		const createNoteComponent = ( note ) => {
			if ( this.state.undoNote && note.id === this.state.undoNote.id ) {
				return (
					<UndoListItem
						ref={ this.storeUndoBar }
						storeImmediateActor={ this.storeUndoActImmediately }
						storeStartSequence={ this.storeUndoStartSequence }
						key={ 'undo-' + this.state.undoAction + '-' + note.id }
						action={ this.state.undoAction }
						note={ this.state.undoNote }
						global={ this.props.global }
					/>
				);
			}

			/* Only show the note if it's not in the list of hidden notes */
			if ( ! this.props.isNoteHidden( note.id ) ) {
				return (
					<Note
						note={ note }
						ref={ this.storeNote( note.id ) }
						key={ 'note-' + note.id }
						detailView={ false }
						client={ this.props.client }
						global={ this.props.global }
						currentNote={ this.props.selectedNoteId }
						selectedNote={ this.props.selectedNote }
					/>
				);
			}
		};

		// Create new groups of messages by time periods
		const noteGroups = groupBy( this.props.notes, ( { timestamp } ) => {
			const time = new Date( timestamp );
			return findIndex( timeGroups, ( [ after, before ] ) => before < time && time <= after );
		} );

		let [ notes ] = reduce(
			noteGroups,
			( [ list, isFirst ], group, index ) => {
				const title = groupTitles[ index ];
				const header = <ListHeader { ...{ key: title, title, isFirst } } />;

				return [ [ ...list, header, ...group.map( createNoteComponent ) ], false ];
			},
			[ [], true ]
		);

		const emptyNoteList = 0 === notes.length;

		var filter = Filters[ this.props.filterName ]();
		var loadingIndicatorVisibility = { opacity: 0 };
		if ( this.props.isLoading ) {
			loadingIndicatorVisibility.opacity = 1;
			if ( emptyNoteList ) {
				loadingIndicatorVisibility.height = this.props.height - TITLE_OFFSET + 'px';
			}
		} else if ( ! this.props.initialLoad && emptyNoteList && filter.emptyMessage ) {
			notes = (
				<EmptyMessage
					emptyMessage={ filter.emptyMessage }
					height={ this.props.height }
					linkMessage={ filter.emptyLinkMessage }
					link={ filter.emptyLink }
					name={ filter.name }
					showing={ this.props.isPanelOpen }
				/>
			);
		} else if (
			! this.props.selectedNoteId &&
			notes.length > 0 &&
			notes.length * 90 > this.props.height
		) {
			// only show if notes exceed window height, estimating note height because
			// we are executing this pre-render
			notes.push(
				<div key="done-message" className="wpnc__done-message">
					{ this.props.translate( 'The End', {
						comment: 'message when end of notifications list reached',
					} ) }
				</div>
			);
		}

		const classes = classNames( 'wpnc__note-list', {
			'disable-sticky': !! window.chrome || !! window.electron, // position: sticky doesn't work in Chrome – `window.chrome` does not exist in electron
			'is-note-open': !! this.props.selectedNoteId,
		} );

		const listViewClasses = classNames( 'wpnc__list-view', {
			wpnc__current: !! this.props.selectedNoteId,
			'is-empty-list': emptyNoteList,
		} );

		return (
			<div className={ classes }>
				<FilterBar controller={ this.props.filterController } />
				<div ref={ this.storeScrollableContainer } className={ listViewClasses }>
					<ol ref={ this.storeNoteList } className="wpnc__notes">
						<StatusBar
							statusClasses={ this.state.statusClasses }
							statusMessage={ this.state.statusMessage }
							statusTimeout={ this.state.statusTimeout }
							statusReset={ this.resetStatusBar }
						/>
						{ notes }
						{ this.props.isLoading && (
							<div style={ loadingIndicatorVisibility } className="wpnc__loading-indicator">
								<Spinner />
							</div>
						) }
					</ol>
				</div>
			</div>
		);
	}
}

const mapStateToProps = ( state ) => ( {
	isLoading: getIsLoading( state ),
	isNoteHidden: ( noteId ) => getIsNoteHidden( state, noteId ),
	isPanelOpen: getIsPanelOpen( state ),
	selectedNoteId: getSelectedNoteId( state ),
	filterName: getFilterName( state ),
} );

const mapDispatchToProps = {
	selectNote: actions.ui.selectNote,
};

export default connect( mapStateToProps, mapDispatchToProps, null, { forwardRef: true } )(
	localize( NoteList )
);
