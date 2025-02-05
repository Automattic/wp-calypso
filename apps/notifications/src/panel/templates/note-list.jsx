import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { Component, createRef } from 'react';
import { connect } from 'react-redux';
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

export class NoteList extends Component {
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

	listElementInternalRef = createRef();

	constructor( props ) {
		super( props );

		this.props.global.updateStatusBar = this.updateStatusBar;
		this.props.global.resetStatusBar = this.resetStatusBar;
		this.props.global.updateUndoBar = this.updateUndoBar;
		this.props.global.resetUndoBar = this.resetUndoBar;

		if ( 'function' === typeof this.props.storeVisibilityUpdater ) {
			this.props.storeVisibilityUpdater( this.ensureSelectedNoteVisibility );
		}
	}

	componentDidMount() {
		this.scrollableContainer.addEventListener( 'scroll', this.onScroll );

		// Prevent wheel events from propagating to the parent container, since they would
		// otherwise be disabled (ie. default prevented); scrolling on this element won't
		// cause the page to scroll because of the `overscroll-behaviour` CSS property.
		this.scrollableContainer?.addEventListener( 'wheel', this.handleWheelScrollingContainer, {
			passive: false,
		} );
		// Disable (ie. prevent default) wheel event on the container, so that the underlying
		// page doesn't get scrolled when the wheel is activated on the notifications panel.
		this.listElementInternalRef.current?.addEventListener(
			'wheel',
			this.handleWheelParentContainer,
			{
				passive: false,
			}
		);
	}

	componentWillUnmount() {
		this.scrollableContainer.removeEventListener( 'scroll', this.onScroll );

		this.scrollableContainer?.removeEventListener( 'wheel', this.handleWheelScrollingContainer, {
			passive: false,
		} );
		this.listElementInternalRef.current?.removeEventListener(
			'wheel',
			this.handleWheelParentContainer,
			{
				passive: false,
			}
		);
	}

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( this.props.isPanelOpen && ! nextProps.isPanelOpen ) {
			// scroll to top, from toggling frame
			this.setState( { scrollY: 0 } );
		}
	}

	componentDidUpdate( prevProps ) {
		if ( this.noteList && ! this.props.isLoading ) {
			const element = this.scrollableContainer;
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

	mergeListElementRefs = ( node ) => {
		// Set the internal ref.
		this.listElementInternalRef.current = node;

		// If listElementRef was provided via props, set it as well.
		const { listElementRef } = this.props;
		if ( listElementRef ) {
			if ( typeof listElementRef === 'function' ) {
				listElementRef( node );
			} else {
				// If it's a ref object, set its current property.
				listElementRef.current = node;
			}
		}
	};

	handleWheelScrollingContainer( e ) {
		// Don't bubble wheel events up so that they don't get disabled.
		e.stopImmediatePropagation();
	}

	handleWheelParentContainer( e ) {
		// Disable wheel events so that they don't cause the underlying page to scroll.
		e.preventDefault();
	}

	onScroll = () => {
		if ( this.isScrolling ) {
			return;
		}

		this.isScrolling = true;

		requestAnimationFrame( () => ( this.isScrolling = false ) );

		const element = this.scrollableContainer;
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
		const { translate } = this.props;

		const groupTitles = [
			translate( 'Today', {
				comment: 'heading for a list of notifications from today',
			} ),
			translate( 'Yesterday', {
				comment: 'heading for a list of notifications from yesterday',
			} ),
			translate( 'Older than 2 days', {
				comment: 'heading for a list of notifications that are more than 2 days old',
			} ),
			translate( 'Older than a week', {
				comment: 'heading for a list of notifications that are more than a week old',
			} ),
			translate( 'Older than a month', {
				comment: 'heading for a list of notifications that are more than a month old',
			} ),
		];

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
						isShowing={ this.props.isPanelOpen }
						handleFocus={ this.props.navigateToNoteById }
					/>
				);
			}
		};

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
		const timeGroups = timeBoundaries
			.slice( 0, -1 )
			.map( ( val, index ) => [ val, timeBoundaries[ index + 1 ] ] );

		// Create new groups of messages by time periods
		const noteGroups = this.props.notes.reduce( ( groups, note ) => {
			const time = new Date( note.timestamp );
			const groupKey = timeGroups.findIndex(
				( [ after, before ] ) => before < time && time <= after
			);

			if ( ! ( groupKey in groups ) ) {
				groups[ groupKey ] = [];
			}

			groups[ groupKey ].push( note );
			return groups;
		}, {} );

		let [ notes ] = Object.entries( noteGroups ).reduce(
			( [ list, isFirst ], [ timeGroupKey, timeGroupNotes ] ) => {
				const title = groupTitles[ timeGroupKey ];
				const header = <ListHeader key={ title } title={ title } isFirst={ isFirst } />;

				return [ [ ...list, header, ...timeGroupNotes.map( createNoteComponent ) ], false ];
			},
			[ [], true ]
		);

		const emptyNoteList = 0 === notes.length;

		const filter = Filters[ this.props.filterName ];
		const loadingIndicatorVisibility = { opacity: 0 };
		if ( this.props.isLoading ) {
			loadingIndicatorVisibility.opacity = 1;
			if ( emptyNoteList ) {
				loadingIndicatorVisibility.height = this.props.height - TITLE_OFFSET + 'px';
			}
		} else if ( ! this.props.initialLoad && emptyNoteList && filter.emptyMessage ) {
			notes = (
				<EmptyMessage
					emptyMessage={ filter.emptyMessage( translate ) }
					height={ this.props.height }
					linkMessage={ filter.emptyLinkMessage( translate ) }
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

		const classes = clsx( 'wpnc__note-list', {
			'is-note-open': !! this.props.selectedNoteId,
		} );

		const listViewClasses = clsx( 'wpnc__list-view', {
			wpnc__current: !! this.props.selectedNoteId,
			'is-empty-list': emptyNoteList,
		} );

		const notificationsListAriaProps = {
			[ 'aria-live' ]: 'polite',
			[ 'aria-description' ]: this.props.translate(
				'Press the Escape key to close the notifications, or continue navigating to read them.'
			),
		};

		return (
			<>
				<div className={ classes } id="wpnc__note-list" ref={ this.mergeListElementRefs }>
					<FilterBar
						controller={ this.props.filterController }
						isPanelOpen={ this.props.isPanelOpen }
						/* eslint-disable-next-line jsx-a11y/no-autofocus */
						autoFocus={ ! this.props.selectedNote }
					/>
					<button className="screen-reader-text" onClick={ this.props.closePanel }>
						{ this.props.translate( 'Close notifications' ) }
					</button>
					<div ref={ this.storeScrollableContainer } className={ listViewClasses }>
						<ol
							ref={ this.storeNoteList }
							className="wpnc__notes"
							{ ...notificationsListAriaProps }
						>
							{ notes }
							{ this.props.isLoading && (
								<div style={ loadingIndicatorVisibility } className="wpnc__loading-indicator">
									<Spinner />
								</div>
							) }
						</ol>
					</div>
				</div>
				<StatusBar
					statusClasses={ this.state.statusClasses }
					statusMessage={ this.state.statusMessage }
					statusTimeout={ this.state.statusTimeout }
					statusReset={ this.resetStatusBar }
				/>
			</>
		);
	}
}

const mapStateToProps = ( state ) => ( {
	isLoading: getIsLoading( state ),
	/**
	 * @todo Fixing this rule requires a larger refactor that isn't worth the time right now.
	 * @see https://github.com/Automattic/wp-calypso/issues/14024
	 */
	// eslint-disable-next-line wpcalypso/redux-no-bound-selectors
	isNoteHidden: ( noteId ) => getIsNoteHidden( state, noteId ),
	isPanelOpen: getIsPanelOpen( state ),
	selectedNoteId: getSelectedNoteId( state ),
	filterName: getFilterName( state ),
} );

const mapDispatchToProps = {
	selectNote: actions.ui.selectNote,
	enableKeyboardShortcuts: actions.ui.enableKeyboardShortcuts,
};

export default connect( mapStateToProps, mapDispatchToProps, null, { forwardRef: true } )(
	localize( NoteList )
);
