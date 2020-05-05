/**
 * External dependencies
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { find, findIndex, matchesProperty } from 'lodash';

/**
 * Internal dependencies
 */
import BackButton from './button-back';
import NavButton from './nav-button';
import NoteList from './note-list';
import AppError from './error';
import FilterBarController from './filter-bar-controller';
import Note from './note';
import { interceptLinks } from '../utils/link-interceptor';

import actions from '../state/actions';
import getAllNotes from '../state/selectors/get-all-notes';
import getIsNoteHidden from '../state/selectors/get-is-note-hidden';
import getIsPanelOpen from '../state/selectors/get-is-panel-open';
import getSelectedNoteId from '../state/selectors/get-selected-note-id';

const KEY_ENTER = 13;
const KEY_ESC = 27;
const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;
const KEY_A = 65;
const KEY_C = 67;
const KEY_F = 70;
const KEY_J = 74;
const KEY_K = 75;
const KEY_L = 76;
const KEY_N = 78;
const KEY_U = 85;

/**
 * @typedef {object} Notification
 * @property {!number} id notification id
 */

/**
 * Returns the next index into a list of notes following
 * the index for the given sought-after notification id
 *
 * @param {!number} noteId id of note to search for
 * @param {!Array<Notification>} notes list of notes to search through
 * @returns {?number} index into note list of note following that given by noteId
 */
export const findNextNoteId = ( noteId, notes ) => {
	if ( notes.length === 0 ) {
		return null;
	}

	const index = findIndex( notes, noteId );
	if ( -1 === index ) {
		return null;
	}

	const nextIndex = index + 1;
	if ( nextIndex >= notes.length ) {
		return null;
	}

	return notes[ nextIndex ].id;
};

class Layout extends React.Component {
	state = {
		lastSelectedIndex: 0,
		navigationEnabled: true,
		previousDetailScrollTop: 0,
		previouslySelectedNoteId: null,
		selectedNote: null,
	};

	UNSAFE_componentWillMount() {
		this.filterController = FilterBarController( this.refreshNotesToDisplay );
		this.props.global.client = this.props.client;
		this.props.global.toggleNavigation = this.toggleNavigation;

		if ( 'undefined' === typeof this.props.global.navigation ) {
			this.props.global.navigation = {};

			/* Keyboard shortcutes */
			this.props.global.keyboardShortcutsAreEnabled = true;
			this.props.global.input = {
				modifierKeyIsActive: this.modifierKeyIsActive,
				lastInputWasKeyboard: false,
			};
		}

		window.addEventListener( 'keydown', this.handleKeyDown, false );
	}

	componentDidMount() {
		window.addEventListener( 'resize', this.redraw );
		if ( this.noteList ) {
			this.height = ReactDOM.findDOMNode( this.noteList ).clientHeight;
		}
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( this.props.selectedNoteId ) {
			this.setState( {
				previousDetailScrollTop: this.detailView ? this.detailView.scrollTop : 0,
				previouslySelectedNoteId: this.props.selectedNoteId,
			} );
		}

		if ( nextProps.state !== this.props.state ) {
			this.setState( nextProps.state );
		}

		if ( ! nextProps.selectedNoteId ) {
			return;
		}

		const index = findIndex( nextProps.notes, matchesProperty( 'id', nextProps.selectedNoteId ) );
		this.setState( {
			index: index >= 0 ? index : null,
			lastSelectedIndex: index === null ? 0 : index,
			selectedNote: nextProps.selectedNoteId,
			navigationEnabled: true,
		} );
	}

	UNSAFE_componentWillUpdate( nextProps ) {
		const { selectedNoteId: nextNote } = nextProps;
		const { selectedNoteId: prevNote } = this.props;
		const noteList = ReactDOM.findDOMNode( this.noteList );

		// jump to detail view
		if ( nextNote && null === prevNote ) {
			this.noteListTop = noteList.scrollTop;
		}

		// If the panel is closed when the component mounts then the calculated height will be zero because it's hidden.
		// When the panel opens, if the height is 0, we set it to the real rendered height.
		if ( ! this.height && nextProps.isShowing ) {
			this.height = noteList.clientHeight;
		}

		// jump to list view
		if ( null === nextNote && prevNote ) {
			noteList.scrollTop = this.noteListTop;
		}

		if ( ! nextProps.selectedNoteId ) {
			return;
		}

		if ( ! find( nextProps.notes, matchesProperty( 'id', nextProps.selectedNoteId ) ) ) {
			this.props.unselectNote();
		}
	}

	componentDidUpdate() {
		if ( ! this.detailView ) {
			return;
		}
		const { previousDetailScrollTop, previouslySelectedNoteId, selectedNote } = this.state;

		this.detailView.scrollTop =
			selectedNote === previouslySelectedNoteId ? previousDetailScrollTop : 0;
	}

	componentWillUnmount() {
		window.removeEventListener( 'resize', this.redraw );
	}

	navigateByDirection = ( direction ) => {
		const filteredNotes = this.filterController.getFilteredNotes( this.props.notes );

		if ( ! this.props.global.keyboardShortcutsAreEnabled ) {
			return;
		}

		if ( filteredNotes.length < 1 ) {
			this.setState( { selectedNote: null, lastSelectedIndex: 0 } );
			return;
		}

		/*
		 * If starting to navigate and we
		 * don't have anything selected,
		 * choose the first note.
		 */
		if ( null === this.state.selectedNote ) {
			return this.setState(
				{
					selectedNote: filteredNotes[ 0 ].id,
					lastSelectedIndex: 0,
				},
				this.noteListVisibilityUpdater
			);
		}

		const stepAtom = direction > 0 ? 1 : -1;
		const noteIndexIsSelectable = ( index ) => {
			/* Note doesn't exist */
			if ( 'undefined' === typeof filteredNotes[ index ] ) {
				return false;
			}

			/* Note is hidden */
			return ! this.props.isNoteHidden( filteredNotes[ index ].id );
		};

		/* Find the currently selected note */
		let currentIndex = findIndex( filteredNotes, matchesProperty( 'id', this.state.selectedNote ) );

		/*
		 * Sometimes it can occur that a note disappears
		 * from our local list due to external events, such
		 * as deleting a comment from `wp-admin`. In this
		 * case, if such a note were previously selected,
		 * it will no longer exist and we won't have a valid
		 * starting point to navigate away from. Start with
		 * the last valid index and look for a selectable note
		 */
		if ( -1 === currentIndex ) {
			let step = 0;
			for (
				let i = this.state.lastSelectedIndex;
				0 <= i && i < filteredNotes.length;
				i = currentIndex + step
			) {
				if ( noteIndexIsSelectable( i ) ) {
					currentIndex = i;
					break;
				} else {
					step = -step + ( step > 0 );
				}
			}
		}

		/* Abort early if we are at an extreme of the note list */
		if ( currentIndex + stepAtom < 0 || currentIndex + stepAtom >= filteredNotes.length ) {
			return;
		}

		let newIndex;
		/* Find nearest note in intended direction */
		for (
			newIndex = currentIndex + stepAtom;
			newIndex >= 0 && newIndex < filteredNotes.length;
			newIndex += stepAtom
		) {
			if ( noteIndexIsSelectable( newIndex ) ) {
				break;
			}
		}

		/* If that didn't work, search in other direction */
		if ( ! noteIndexIsSelectable( newIndex ) ) {
			for (
				newIndex = currentIndex - stepAtom;
				newIndex >= 0 && newIndex < filteredNotes.length;
				newIndex -= stepAtom
			) {
				if ( noteIndexIsSelectable( newIndex ) ) {
					break;
				}
			}
		}

		/* If still no note is available, give up */
		if ( ! noteIndexIsSelectable( newIndex ) ) {
			return;
		}

		/* If we are in detail view, move to next note */
		if ( this.props.selectedNoteId ) {
			return this.props.selectNote( filteredNotes[ newIndex ].id );
		}

		this.setState(
			{
				selectedNote: filteredNotes[ newIndex ].id,
				lastSelectedIndex: newIndex,
			},
			this.noteListVisibilityUpdater
		);
	};

	navigateToNextNote = () => {
		this.navigateByDirection( 1 );
	};

	navigateToPrevNote = () => {
		this.navigateByDirection( -1 );
	};

	toggleNavigation = ( navigationEnabled ) => {
		return 'boolean' === typeof navigationEnabled && this.setState( { navigationEnabled } );
	};

	redraw = () => {
		if ( this.isRefreshing ) {
			return;
		}

		this.isRefreshing = true;

		requestAnimationFrame( () => ( this.isRefreshing = false ) );

		if ( this.noteList ) {
			this.height = ReactDOM.findDOMNode( this.noteList ).clientHeight;
		}
		this.forceUpdate();
	};

	modifierKeyIsActive = ( e ) => {
		return e.altKey || e.ctrlKey || e.metaKey;
	};

	handleKeyDown = ( event ) => {
		if ( ! this.props.isShowing ) {
			return;
		}

		const stopEvent = function () {
			event.stopPropagation();
			event.preventDefault();
		};

		// don't handle if we aren't visible
		if ( ! this.props.isPanelOpen ) {
			return;
		}

		/* ESC is a super-action, always treat it */
		if ( KEY_ESC === event.keyCode ) {
			this.props.closePanel();
			stopEvent();
			return;
		}

		/* otherwise bypass if shortcuts are disabled */
		if ( ! this.props.global.keyboardShortcutsAreEnabled ) {
			return;
		}

		/*
		 * The following shortcuts require that
		 * the modifier keys not be active. Shortcuts
		 * that require a modifier key should be
		 * captured above.
		 */
		if ( this.props.global.input.modifierKeyIsActive( event ) ) {
			return;
		}

		const activateKeyboard = () => ( this.props.global.input.lastInputWasKeyboard = true );

		switch ( event.keyCode ) {
			case KEY_RIGHT:
				activateKeyboard();
				this.props.unselectNote();
				break;
			case KEY_ENTER:
			case KEY_LEFT:
				if ( ! this.props.selectedNoteId && null !== this.state.selectedNote ) {
					/*
					 * If we navigate while in the detail view, we can
					 * accidentally wipe out the reply text while writing it
					 */
					activateKeyboard();
					this.props.selectNote( this.state.selectedNote );
				} else if ( this.props.selectedNoteId ) {
					this.props.unselectNote();
				}
				break;
			case KEY_DOWN:
			case KEY_J:
				stopEvent();
				activateKeyboard();
				this.navigateToNextNote();
				break;
			case KEY_UP:
			case KEY_K:
				stopEvent();
				activateKeyboard();
				this.navigateToPrevNote();
				break;
			case KEY_N:
				this.props.closePanel();
				stopEvent();
				break;
			case KEY_A: // All filter
				if ( ! this.props.selectedNoteId ) {
					this.filterController.selectFilter( 'all' );
				}
				break;
			case KEY_U: // Unread filter
				if ( ! this.props.selectedNoteId && ! ( this.noteList && this.noteList.state.undoNote ) ) {
					this.filterController.selectFilter( 'unread' );
				}
				break;
			case KEY_C: // Comments filter
				if ( ! this.props.selectedNoteId ) {
					this.filterController.selectFilter( 'comments' );
				}
				break;
			case KEY_F: // Follows filter
				if ( ! this.props.selectedNoteId ) {
					this.filterController.selectFilter( 'follows' );
				}
				break;
			case KEY_L: // Likes filter
				if ( ! this.props.selectedNoteId ) {
					this.filterController.selectFilter( 'likes' );
				}
				break;
		}
	};

	refreshNotesToDisplay = ( allNotes ) => {
		const notes = this.filterController.getFilteredNotes( allNotes );
		if (
			this.state.selectedNote &&
			find( notes, matchesProperty( 'id', this.state.selectedNoteId ) ) === null
		) {
			this.props.unselectNote();
		}

		this.setState( { notes } );
	};

	storeNoteList = ( ref ) => {
		this.noteList = ref;
	};

	storeDetailViewRef = ( ref ) => {
		this.detailView = ref;
	};

	storeNoteListVisibilityUpdater = ( updater ) => {
		this.noteListVisibilityUpdater = updater;
	};

	render() {
		const currentNote = find(
			this.props.notes,
			matchesProperty( 'id', this.props.selectedNoteId )
		);
		const filteredNotes = this.filterController.getFilteredNotes( this.props.notes );

		return (
			<div onClick={ interceptLinks }>
				{ this.props.error && <AppError error={ this.props.error } /> }

				{ ! this.props.error && (
					<NoteList
						ref={ this.storeNoteList }
						storeVisibilityUpdater={ this.storeNoteListVisibilityUpdater }
						client={ this.props.client }
						filterController={ this.filterController }
						global={ this.props.global }
						height={ this.height }
						initialLoad={ this.props.notes === null }
						notes={ filteredNotes }
						selectedNote={ this.state.selectedNote }
					/>
				) }

				<div className={ currentNote ? 'wpnc__single-view wpnc__current' : 'wpnc__single-view' }>
					{ this.props.selectedNoteId && currentNote && (
						<header>
							<h1>{ currentNote.title }</h1>
							<nav>
								<BackButton
									isEnabled={ this.state.navigationEnabled }
									global={ this.props.global }
								/>
								<div>
									<NavButton
										iconName="arrow-up"
										className="wpnc__prev"
										isEnabled={
											( filteredNotes[ 0 ] &&
												filteredNotes[ 0 ].id !== this.props.selectedNoteId ) ||
											false
										}
										navigate={ this.navigateToPrevNote }
									/>
									<NavButton
										iconName="arrow-down"
										className="wpnc__next"
										isEnabled={
											( filteredNotes[ 0 ] &&
												filteredNotes[ filteredNotes.length - 1 ].id !==
													this.props.selectedNoteId ) ||
											false
										}
										navigate={ this.navigateToNextNote }
									/>
								</div>
							</nav>
						</header>
					) }

					{ currentNote && (
						<ol ref={ this.storeDetailViewRef }>
							<Note
								key={ 'note-' + currentNote.id }
								client={ this.props.client }
								currentNote={ this.props.selectedNoteId }
								detailView={ true }
								global={ this.props.global }
								note={ currentNote }
								selectedNote={ this.state.selectedNote }
							/>
						</ol>
					) }
				</div>
			</div>
		);
	}
}

const mapStateToProps = ( state ) => ( {
	isNoteHidden: ( noteId ) => getIsNoteHidden( state, noteId ),
	isPanelOpen: getIsPanelOpen( state ),
	notes: getAllNotes( state ),
	selectedNoteId: getSelectedNoteId( state ),
} );

const mapDispatchToProps = {
	closePanel: actions.ui.closePanel,
	selectNote: actions.ui.selectNote,
	unselectNote: actions.ui.unselectNote,
};

export default connect( mapStateToProps, mapDispatchToProps )( Layout );
