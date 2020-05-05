import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

import { wpcom } from '../rest-client/wpcom';

import actions from '../state/actions';
import getSelectedNoteId from '../state/selectors/get-selected-note-id';

import { bumpStat } from '../rest-client/bump-stat';

import Gridicon from './gridicons';

var { recordTracksEvent } = require( '../helpers/stats' );

const KEY_U = 85;

export class UndoListItem extends React.Component {
	state = {
		undoTimer: null /* handle for queued action timer */,
		undoTimeout: 4500 /* ms until action is actually executed */,
		isVisible: true /* should this undo item be visible */,
	};

	componentDidMount() {
		window.addEventListener( 'keydown', this.handleKeyDown, false );

		if ( this.props.storeImmediateActor ) {
			this.props.storeImmediateActor( this.actImmediately );
		}

		if ( this.props.storeStartSequence ) {
			this.props.storeStartSequence( this.startUndoSequence );
		}
	}

	componentWillUnmount() {
		window.removeEventListener( 'keydown', this.handleKeyDown, false );
	}

	handleKeyDown = ( event ) => {
		if ( ! this.props.global.keyboardShortcutsAreEnabled ) {
			return;
		}

		if ( this.props.global.input.modifierKeyIsActive( event ) ) {
			return;
		}

		if ( null !== this.state.undoTimer && ! this.props.selectedNoteId && KEY_U === event.keyCode ) {
			this.cancelAction( event );
		}
	};

	/*
	 * Use the prop update to trigger execution
	 */
	componentDidUpdate( prevProps ) {
		if ( null === this.props.action || '' === this.props.action ) {
			return;
		}

		if ( null === this.state.undoTimer && prevProps.action !== this.props.action ) {
			this.startUndoSequence();
		}
	}

	startUndoSequence = () => {
		var timerHandle = setTimeout( this.executor, this.state.undoTimeout );

		this.instance && this.setState( { undoTimer: timerHandle } );
	};

	executor = () => {
		var actionHandlers = {
			spam: this.spamComment,
			trash: this.deleteComment,
		};

		if ( ! ( this.props.action in actionHandlers ) ) {
			this.props.global.resetUndoBar();
			return;
		}

		actionHandlers[ this.props.action ]();
	};

	spamComment = () => {
		var comment = wpcom()
			.site( this.props.note.meta.ids.site )
			.comment( this.props.note.meta.ids.comment );
		var component = this;

		var updateSpamStatus = function ( error, data ) {
			if ( error ) throw error;

			if ( 'spam' != data.status ) {
				// TODO: Handle failure to set Spam status
			}
		};

		comment.get( function ( error, data ) {
			if ( error ) throw error;

			data.status = 'spam';
			comment.update( data, updateSpamStatus );
		} );

		this.props.removeNotes( [ this.props.note.id ] );

		component.finishExecution();
	};

	deleteComment = () => {
		wpcom()
			.site( this.props.note.meta.ids.site )
			.comment( this.props.note.meta.ids.comment )
			.del( ( error ) => {
				if ( error ) throw error;
			} );

		this.instance && this.setState( { isVisible: false } );

		this.props.removeNotes( [ this.props.note.id ] );

		this.finishExecution();
	};

	actImmediately = ( event ) => {
		if ( event && event.preventDefault ) {
			event.preventDefault();
		}
		clearTimeout( this.state.undoTimer );
		this.instance && this.setState( { isVisible: false } );
		this.executor();
	};

	cancelAction = ( event ) => {
		if ( event ) {
			event.preventDefault();
			event.stopPropagation();
		}
		this.props.undoAction( this.props.note.id );
		clearTimeout( this.state.undoTimer );
		switch ( this.props.action ) {
			case 'spam':
				bumpStat( 'notes-click-action', 'unspam-comment' );
				recordTracksEvent( 'calypso_notification_note_unspam', {
					note_type: this.props.note.type,
				} );
				break;
			case 'trash':
				bumpStat( 'notes-click-action', 'untrash-comment' );
				recordTracksEvent( 'calypso_notification_note_untrash', {
					note_type: this.props.note.type,
				} );
				break;
		}
		this.finishExecution();
		this.props.selectNote( this.props.note.id );
	};

	finishExecution = () => {
		this.instance && this.setState( { undoTimer: null } );
		this.props.global.resetUndoBar();
	};

	storeInstance = ( ref ) => {
		this.instance = ref;
	};

	render() {
		var actionMessages = {
			spam: this.props.translate( 'Comment marked as spam' ),
			trash: this.props.translate( 'Comment trashed' ),
		};
		var undo_text = this.props.translate( 'Undo', { context: 'verb: imperative' } );

		var message = actionMessages[ this.props.action ];
		var isVisible = this.state.isVisible ? { display: 'block' } : { display: 'none' };

		return (
			<div ref={ this.storeInstance } className="wpnc__summary wpnc__undo-item" style={ isVisible }>
				<p>
					<button className="wpnc__undo-link" onClick={ this.cancelAction }>
						{ undo_text }
					</button>
					<span className="wpnc__undo-message">{ message }</span>
					<button className="wpnc__close-link" onClick={ this.actImmediately }>
						<Gridicon icon="cross" size={ 24 } />
					</button>
				</p>
			</div>
		);
	}
}

const mapStateToProps = ( state ) => ( {
	selectedNoteId: getSelectedNoteId( state ),
} );

const mapDispatchToProps = {
	removeNotes: actions.notes.removeNotes,
	selectNote: actions.ui.selectNote,
	undoAction: actions.ui.undoAction,
};

export default connect( mapStateToProps, mapDispatchToProps, null, { pure: false } )(
	localize( UndoListItem )
);
