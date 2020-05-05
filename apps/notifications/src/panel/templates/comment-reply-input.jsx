import React from 'react';
import createReactClass from 'create-react-class';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

import actions from '../state/actions';
import getSiteSuggestions from '../state/selectors/get-site-suggestions';

/**
 * Internal dependencies
 */
import { disableKeyboardShortcuts, enableKeyboardShortcuts } from '../flux/input-actions';
import Spinner from './spinner';
import Suggestions from '../suggestions';
import repliesCache from '../comment-replies-cache';
import { wpcom } from '../rest-client/wpcom';
import { bumpStat } from '../rest-client/bump-stat';
import { formatString, validURL } from './functions';

var debug = require( 'debug' )( 'notifications:reply' );
var { recordTracksEvent } = require( '../helpers/stats' );

const hasTouch = () =>
	'ontouchstart' in window || ( window.DocumentTouch && document instanceof DocumentTouch );

const CommentReplyInput = createReactClass( {
	displayName: 'CommentReplyInput',
	mixins: [ repliesCache.LocalStorageMixin, Suggestions ],

	statics: {
		stopEvent: function ( event ) {
			event.stopPropagation();
			event.preventDefault();
		},
	},

	getInitialState: function () {
		var getSavedReply = function () {
			var savedReply = this.localStorage.getItem( this.savedReplyKey );

			return savedReply ? savedReply[ 0 ] : '';
		};

		this.savedReplyKey = 'reply_' + this.props.note.id;

		return {
			value: getSavedReply.apply( this ),
			hasClicked: false,
			isSubmitting: false,
			rowCount: 1,
			retryCount: 0,
		};
	},

	componentDidMount: function () {
		window.addEventListener( 'keydown', this.handleKeyDown, false );
		window.addEventListener( 'keydown', this.handleCtrlEnter, false );
	},

	componentWillUnmount: function () {
		window.removeEventListener( 'keydown', this.handleKeyDown, false );
		window.removeEventListener( 'keydown', this.handleCtrlEnter, false );

		enableKeyboardShortcuts();
	},

	handleKeyDown: function ( event ) {
		if ( ! this.props.global.keyboardShortcutsAreEnabled ) {
			return;
		}

		if ( this.props.global.input.modifierKeyIsActive( event ) ) {
			return;
		}

		if ( 82 == event.keyCode ) {
			/* 'r' key */
			this.replyInput.focus();
			CommentReplyInput.stopEvent( event );
		}
	},

	handleCtrlEnter: function ( event ) {
		if ( this.state.isSubmitting ) {
			return;
		}

		if ( ( event.ctrlKey || event.metaKey ) && ( 10 == event.keyCode || 13 == event.keyCode ) ) {
			CommentReplyInput.stopEvent( event );
			this.handleSubmit();
		}
	},

	handleSendEnter: function ( event ) {
		if ( this.state.isSubmitting ) {
			return;
		}

		if ( 13 == event.keyCode ) {
			CommentReplyInput.stopEvent( event );
			this.handleSubmit();
		}
	},

	handleChange: function ( event ) {
		var textarea = this.replyInput;

		disableKeyboardShortcuts();

		this.setState( {
			value: event.target.value,
			rowCount: Math.min(
				4,
				Math.ceil( ( textarea.scrollHeight * this.state.rowCount ) / textarea.clientHeight )
			),
		} );

		// persist the comment reply on local storage
		if ( this.savedReplyKey ) {
			this.localStorage.setItem( this.savedReplyKey, [ event.target.value, Date.now() ] );
		}
	},

	handleClick: function ( event ) {
		disableKeyboardShortcuts();

		if ( ! this.state.hasClicked ) {
			this.setState( {
				hasClicked: true,
			} );
		}
	},

	handleFocus: function () {
		disableKeyboardShortcuts();
	},

	handleBlur: function () {
		enableKeyboardShortcuts();

		// Reset the field if there's no valid user input
		// The regex strips whitespace
		if ( '' == this.state.value.replace( /^\s+|\s+$/g, '' ) ) {
			this.setState( {
				value: '',
				hasClicked: false,
				rowCount: 1,
			} );
		}
	},

	handleSubmit( event ) {
		var wpObject,
			submitComment,
			component = this,
			statusMessage,
			successMessage = this.props.translate( 'Reply posted!' ),
			linkMessage = this.props.translate( 'View your comment.' );

		if ( event ) {
			event.preventDefault();
		}

		if ( '' == this.state.value ) return;

		this.props.global.toggleNavigation( false );

		this.setState( {
			isSubmitting: true,
		} );

		if ( this.state.retryCount == 0 ) {
			bumpStat( 'notes-click-action', 'replyto-comment' );
			recordTracksEvent( 'calypso_notification_note_reply', {
				note_type: this.props.note.type,
			} );
		}

		if ( this.props.note.meta.ids.comment ) {
			wpObject = wpcom()
				.site( this.props.note.meta.ids.site )
				.comment( this.props.note.meta.ids.comment );
			submitComment = wpObject.reply;
		} else {
			wpObject = wpcom()
				.site( this.props.note.meta.ids.site )
				.post( this.props.note.meta.ids.post )
				.comment();
			submitComment = wpObject.add;
		}

		submitComment.call( wpObject, this.state.value, ( error, data ) => {
			if ( error ) {
				const errorMessageDuplicateComment = this.props.translate(
					"Duplicate comment; you've already said that!"
				);
				const errorMessage = this.props.translate( 'Reply Failed: Please, try again.' );

				// Handle known exceptions
				if ( 'CommentDuplicateError' === error.name ) {
					// Reset the reply form
					this.setState( {
						isSubmitting: false,
						retryCount: 0,
					} );
					this.replyInput.focus();

					this.props.global.updateStatusBar( errorMessageDuplicateComment, [ 'fail' ], 6000 );
					this.props.unselectNote();
				} else if ( component.state.retryCount < 3 ) {
					component.setState( {
						retryCount: component.state.retryCount + 1,
					} );

					window.setTimeout( function () {
						component.handleSubmit();
					}, 2000 * component.state.retryCount );
				} else {
					component.setState( {
						isSubmitting: false,
						retryCount: 0,
					} );

					/* Flag submission failure */
					component.props.global.updateStatusBar( errorMessage, [ 'fail' ], 6000 );

					enableKeyboardShortcuts();
					component.props.global.toggleNavigation( true );

					debug( 'Failed to submit comment reply: %s', error.message );
				}

				return;
			}

			if ( component.props.note.meta.ids.comment ) {
				// pre-emptively approve the comment if it wasn't already
				component.props.approveNote( component.props.note.id, true );
				component.props.global.client.getNote( component.props.note.id );
			}

			// remove focus from textarea so we can resume using keyboard
			// shortcuts without typing in the field
			component.replyInput.blur();

			if ( data.URL && validURL.test( data.URL ) ) {
				statusMessage = formatString(
					'{0} <a target="_blank" href="{1}">{2}</a>',
					successMessage,
					data.URL,
					linkMessage
				);
			} else {
				statusMessage = successMessage;
			}

			component.props.global.updateStatusBar( statusMessage, [ 'success' ], 12000 );

			enableKeyboardShortcuts();
			component.props.global.toggleNavigation( true );

			component.setState( {
				value: '',
				isSubmitting: false,
				hasClicked: false,
				rowCount: 1,
				retryCount: 0,
			} );

			// remove the comment reply from local storage
			component.localStorage.removeItem( component.savedReplyKey );

			// route back to list after successful comment post
			component.props.selectNote( component.props.note.id );
		} );
	},

	storeReplyInput( ref ) {
		this.replyInput = ref;
	},

	render: function () {
		var value = this.state.value;
		var submitLink = '';
		var sendText = this.props.translate( 'Send', { context: 'verb: imperative' } );

		if ( this.state.isSubmitting ) {
			submitLink = <Spinner className="wpnc__spinner" />;
		} else {
			if ( value.length ) {
				var submitLinkTitle = this.props.translate( 'Submit reply', {
					context: 'verb: imperative',
				} );
				submitLink = (
					<button
						title={ submitLinkTitle }
						className="active"
						onClick={ this.handleSubmit }
						onKeyDown={ this.handleSendEnter }
					>
						{ sendText }
					</button>
				);
			} else {
				var submitLinkTitle = this.props.translate( 'Write your response in order to submit' );
				submitLink = (
					<button title={ submitLinkTitle } className="inactive">
						{ sendText }
					</button>
				);
			}
		}

		return (
			<div className="wpnc__reply-box">
				<textarea
					ref={ this.storeReplyInput }
					rows={ this.state.rowCount }
					value={ value }
					placeholder={ this.props.defaultValue }
					onClick={ this.handleClick }
					onFocus={ this.handleFocus }
					onBlur={ this.handleBlur }
					onChange={ this.handleChange }
				/>
				{ submitLink }
				{ this.renderSuggestions() }
			</div>
		);
	},
} );

const mapStateToProps = ( state, { note } ) => ( {
	suggestions: getSiteSuggestions( state, note.meta.ids.site ),
} );

const mapDispatchToProps = {
	approveNote: actions.notes.approveNote,
	fetchSuggestions: actions.suggestions.fetchSuggestions,
	selectNote: actions.ui.selectNote,
	unselectNote: actions.ui.unselectNote,
};

export default connect( mapStateToProps, mapDispatchToProps, null, { pure: false } )(
	localize( CommentReplyInput )
);
