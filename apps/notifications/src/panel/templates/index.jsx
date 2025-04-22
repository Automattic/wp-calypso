import { Component } from 'react';
import { connect } from 'react-redux';
import { modifierKeyIsActive } from '../helpers/input';
import actions from '../state/actions';
import getAllNotes from '../state/selectors/get-all-notes';
import getIsNoteHidden from '../state/selectors/get-is-note-hidden';
import getIsPanelOpen from '../state/selectors/get-is-panel-open';
import getKeyboardShortcutsEnabled from '../state/selectors/get-keyboard-shortcuts-enabled';
import getSelectedNoteId from '../state/selectors/get-selected-note-id';
import { interceptLinks } from '../utils/link-interceptor';
import BackButton from './button-back';
import AppError from './error';
import FilterBarController from './filter-bar-controller';
import NavButton from './nav-button';
import Note from './note';
import NoteList from './note-list';

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
 * @typedef {Object} Notification
 * @property {!number} id notification id
 */

/**
 * Returns the next index into a list of notes following
 * the index for the given sought-after notification id
 * @param {!number} noteId id of note to search for
 * @param {!Array<Notification>} notes list of notes to search through
 * @returns {?number} index into note list of note following that given by noteId
 */
export const findNextNoteId = ( noteId, notes ) => {
	if ( notes.length === 0 ) {
		return null;
	}

	const index = notes.indexOf( noteId );
	if ( -1 === index ) {
		return null;
	}

	const nextIndex = index + 1;
	if ( nextIndex >= notes.length ) {
		return null;
	}

	return notes[ nextIndex ].id;
};

class Layout extends Component {
	state = {
		lastSelectedIndex: 0,
		navigationEnabled: true,
		previousDetailScrollTop: 0,
		previouslySelectedNoteId: null,
		/** The note that will be open in the detail view */
		selectedNote: null,
	};

	constructor( props ) {
		super( props );

		this.filterController = FilterBarController( this.refreshNotesToDisplay );
		this.props.global.client = this.props.client;
		this.props.global.toggleNavigation = this.toggleNavigation;

		if ( 'undefined' === typeof this.props.global.navigation ) {
			this.props.global.navigation = {};

			/* Keyboard shortcutes */
			this.props.global.input = {
				lastInputWasKeyboard: false,
			};
		}
		this.props.enableKeyboardShortcuts();
	}

	componentDidMount() {
		window.addEventListener( 'keydown', this.handleKeyDown, false );
		window.addEventListener( 'resize', this.redraw );
		if ( this.noteListElement ) {
			this.height = this.noteListElement.clientHeight;
		}
	}

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
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

		const index = nextProps.notes.findIndex( ( n ) => n.id === nextProps.selectedNoteId );
		this.setState( {
			lastSelectedIndex: index === null ? 0 : index,
			selectedNote: nextProps.selectedNoteId,
			navigationEnabled: true,
		} );
	}

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillUpdate( nextProps ) {
		const { selectedNoteId: nextNote } = nextProps;
		const { selectedNoteId: prevNote } = this.props;
		const noteList = this.noteListElement;

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

		if ( ! nextProps.notes.find( ( n ) => n.id === nextProps.selectedNoteId ) ) {
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
		window.removeEventListener( 'keydown', this.handleKeyDown );
	}

	navigateByDirection = ( direction ) => {
		const filteredNotes = this.filterController.getFilteredNotes( this.props.notes );

		if ( ! this.props.keyboardShortcutsAreEnabled ) {
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
		let currentIndex = filteredNotes.findIndex( ( n ) => n.id === this.state.selectedNote );

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

	navigateToNoteById = ( noteId ) => {
		const filteredNotes = this.filterController.getFilteredNotes( this.props.notes );
		const newIndex = filteredNotes.findIndex( ( { id } ) => id === noteId );
		this.setState(
			{
				selectedNote: filteredNotes[ newIndex ].id,
				lastSelectedIndex: newIndex,
			},
			this.noteListVisibilityUpdater
		);
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

		if ( this.noteListElement ) {
			this.height = this.noteListElement.clientHeight;
		}
		this.forceUpdate();
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
		if ( KEY_ESC === event.keyCode && ! this.props.selectedNoteId ) {
			this.props.closePanel();
			stopEvent();
			return;
		}

		/* otherwise bypass if shortcuts are disabled */
		if ( ! this.props.keyboardShortcutsAreEnabled ) {
			return;
		}

		/*
		 * The following shortcuts require that
		 * the modifier keys not be active. Shortcuts
		 * that require a modifier key should be
		 * captured above.
		 */
		if ( modifierKeyIsActive( event ) ) {
			return;
		}

		const activateKeyboard = () => ( this.props.global.input.lastInputWasKeyboard = true );

		switch ( event.keyCode ) {
			case KEY_ESC:
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
			case KEY_F: // Subscriptions (previously "follows") filter
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
			notes.find( ( n ) => n.id === this.state.selectedNoteId ) === undefined
		) {
			this.props.unselectNote();
		}
	};

	storeNoteList = ( ref ) => {
		this.noteList = ref;
	};

	storeNoteListElement = ( ref ) => {
		this.noteListElement = ref;
	};

	storeDetailViewRef = ( ref ) => {
		this.detailView = ref;
	};

	storeNoteListVisibilityUpdater = ( updater ) => {
		this.noteListVisibilityUpdater = updater;
	};

	render() {
		const currentNote = this.props.notes.find( ( n ) => n.id === this.props.selectedNoteId );
		const filteredNotes = this.filterController.getFilteredNotes( this.props.notes );

		return (
			// Note: this onClick is used to intercept events from children elements.
			// As a result, it's not really meant to be treated as a clickable
			// element itself. There may be better ways to handle this, but
			// let's disable eslint here for now to avoid refactoring older code.
			// eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
			<div className="color-scheme is-global" onClick={ this.props.interceptLinks }>
				{ this.props.error && <AppError error={ this.props.error } /> }

				{ ! this.props.error && (
					<NoteList
						ref={ this.storeNoteList }
						listElementRef={ this.storeNoteListElement }
						storeVisibilityUpdater={ this.storeNoteListVisibilityUpdater }
						client={ this.props.client }
						filterController={ this.filterController }
						global={ this.props.global }
						height={ this.height }
						initialLoad={ this.props.notes === null }
						notes={ filteredNotes }
						selectedNote={ this.state.selectedNote }
						closePanel={ this.props.closePanel }
						navigateToNoteById={ this.navigateToNoteById }
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
								detailView
								global={ this.props.global }
								note={ currentNote }
								selectedNote={ this.state.selectedNote }
								handleFocus={ () => {} }
							/>
						</ol>
					) }
				</div>
			</div>
		);
	}
}

const mapStateToProps = ( state ) => ( {
	/**
	 * @todo Fixing this rule requires a larger refactor that isn't worth the time right now.
	 * @see https://github.com/Automattic/wp-calypso/issues/14024
	 */
	// eslint-disable-next-line wpcalypso/redux-no-bound-selectors
	isNoteHidden: ( noteId ) => getIsNoteHidden( state, noteId ),
	isPanelOpen: getIsPanelOpen( state ),
	notes: getAllNotes( state ),
	selectedNoteId: getSelectedNoteId( state ),
	keyboardShortcutsAreEnabled: getKeyboardShortcutsEnabled( state ),
} );

const mapDispatchToProps = {
	closePanel: actions.ui.closePanel,
	selectNote: actions.ui.selectNote,
	unselectNote: actions.ui.unselectNote,
	enableKeyboardShortcuts: actions.ui.enableKeyboardShortcuts,
	interceptLinks,
};

export default connect( mapStateToProps, mapDispatchToProps )( Layout );
