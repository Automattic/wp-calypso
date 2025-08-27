import { __experimentalVStack as VStack, Button, TextareaControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { createRef, Component } from 'react';
import { connect } from 'react-redux';
import repliesCache from '../../panel/comment-replies-cache';
import { modifierKeyIsActive } from '../../panel/helpers/input';
import { bumpStat } from '../../panel/rest-client/bump-stat';
import { wpcom } from '../../panel/rest-client/wpcom';
import actions from '../../panel/state/actions';
import getKeyboardShortcutsEnabled from '../../panel/state/selectors/get-keyboard-shortcuts-enabled';
import Suggestions from '../../panel/suggestions';
import { formatString, validURL } from '../../panel/templates/functions';
const debug = require( 'debug' )( 'notifications:reply' );
const { recordTracksEvent } = require( '../../panel/helpers/stats' );

function stopEvent( event ) {
	event.stopPropagation();
	event.preventDefault();
}

class CommentReplyInput extends Component {
	replyInput = createRef();

	constructor( props ) {
		super( props );

		this.savedReplyKey = 'reply_' + this.props.note.id;

		const savedReply = repliesCache.getItem( this.savedReplyKey );
		const savedReplyValue = savedReply ? savedReply[ 0 ] : '';

		this.state = {
			value: savedReplyValue,
			hasClicked: false,
			isSubmitting: false,
			rowCount: 1,
			retryCount: 0,
		};
	}

	componentDidMount() {
		window.addEventListener( 'keydown', this.handleKeyDown, false );
		window.addEventListener( 'keydown', this.handleCtrlEnter, false );
	}

	componentWillUnmount() {
		window.removeEventListener( 'keydown', this.handleKeyDown, false );
		window.removeEventListener( 'keydown', this.handleCtrlEnter, false );

		this.props.enableKeyboardShortcuts();
	}

	handleKeyDown = ( event ) => {
		if ( ! this.props.keyboardShortcutsAreEnabled ) {
			return;
		}

		if ( modifierKeyIsActive( event ) ) {
			return;
		}

		if ( 82 === event.keyCode ) {
			/* 'r' key */
			this.replyInput.current.focus();
			stopEvent( event );
		}
	};

	handleCtrlEnter = ( event ) => {
		if ( this.state.isSubmitting ) {
			return;
		}

		if ( ( event.ctrlKey || event.metaKey ) && ( 10 === event.keyCode || 13 === event.keyCode ) ) {
			stopEvent( event );
			this.handleSubmit();
		}
	};

	handleSendEnter = ( event ) => {
		if ( this.state.isSubmitting ) {
			return;
		}

		if ( 13 === event.keyCode ) {
			stopEvent( event );
			this.handleSubmit();
		}
	};

	handleChange = ( value ) => {
		const textarea = this.replyInput.current;

		this.props.disableKeyboardShortcuts();

		this.setState( {
			value,
			rowCount: Math.min(
				4,
				Math.ceil( ( textarea.scrollHeight * this.state.rowCount ) / textarea.clientHeight )
			),
		} );

		// persist the comment reply on local storage
		if ( this.savedReplyKey ) {
			repliesCache.setItem( this.savedReplyKey, [ value, Date.now() ] );
		}
	};

	handleClick = () => {
		this.props.disableKeyboardShortcuts();

		if ( ! this.state.hasClicked ) {
			this.setState( {
				hasClicked: true,
			} );
		}
	};

	handleFocus = () => {
		this.props.disableKeyboardShortcuts();
	};

	handleBlur = () => {
		this.props.enableKeyboardShortcuts();

		// Reset the field if there's no valid user input
		// The regex strips whitespace
		if ( '' === this.state.value.replace( /^\s+|\s+$/g, '' ) ) {
			this.setState( {
				value: '',
				hasClicked: false,
				rowCount: 1,
			} );
		}
	};

	handleSubmit = ( event ) => {
		let wpObject;
		let submitComment;
		let statusMessage;
		const successMessage = __( 'Reply posted!' );
		const linkMessage = __( 'View your comment.' );

		if ( event ) {
			event.preventDefault();
			event.stopPropagation();
		}

		if ( '' === this.state.value ) {
			return;
		}

		this.props.global.toggleNavigation( false );

		this.setState( {
			isSubmitting: true,
		} );

		if ( this.state.retryCount === 0 ) {
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
				const errorMessageDuplicateComment = __( "Duplicate comment; you've already said that!" );
				const errorMessage = __( 'Reply Failed: Please, try again.' );

				// Handle known exceptions
				if ( 'CommentDuplicateError' === error.name ) {
					// Reset the reply form
					this.setState( {
						isSubmitting: false,
						retryCount: 0,
					} );
					this.replyInput.current.focus();

					this.props.global.updateStatusBar( errorMessageDuplicateComment, [ 'fail' ], 6000 );
					this.props.unselectNote();
				} else if ( this.state.retryCount < 3 ) {
					this.setState( {
						retryCount: this.state.retryCount + 1,
					} );

					window.setTimeout( () => this.handleSubmit(), 2000 * this.state.retryCount );
				} else {
					this.setState( {
						isSubmitting: false,
						retryCount: 0,
					} );

					/* Flag submission failure */
					this.props.global.updateStatusBar( errorMessage, [ 'fail' ], 6000 );

					this.props.enableKeyboardShortcuts();
					this.props.global.toggleNavigation( true );

					debug( 'Failed to submit comment reply: %s', error.message );
				}

				return;
			}

			if ( this.props.note.meta.ids.comment ) {
				// pre-emptively approve the comment if it wasn't already
				this.props.approveNote( this.props.note.id, true );
				this.props.global.client.getNote( this.props.note.id );
			}

			// remove focus from textarea so we can resume using keyboard
			// shortcuts without typing in the field
			this.replyInput.current.blur();

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

			this.props.global.updateStatusBar( statusMessage, [ 'success' ], 12000 );

			this.props.enableKeyboardShortcuts();
			this.props.global.toggleNavigation( true );

			this.setState( {
				value: '',
				isSubmitting: false,
				hasClicked: false,
				rowCount: 1,
				retryCount: 0,
			} );

			// remove the comment reply from local storage
			repliesCache.removeItem( this.savedReplyKey );

			// route back to list after successful comment post
			this.props.selectNote( this.props.note.id );
		} );
	};

	insertSuggestion = ( suggestion, suggestionsQuery ) => {
		if ( ! suggestion ) {
			return;
		}

		const element = this.replyInput.current;
		const caretPosition = element.selectionStart;
		const startString = this.state.value.slice(
			0,
			Math.max( caretPosition - suggestionsQuery.length, 0 )
		);
		const endString = this.state.value.slice( caretPosition );

		this.setState( {
			value: startString + suggestion.user_login + ' ' + endString,
		} );

		element.focus();

		// move the caret after the inserted suggestion
		const insertPosition = startString.length + suggestion.user_login.length + 1;
		setTimeout( () => element.setSelectionRange( insertPosition, insertPosition ), 0 );
	};

	render() {
		const { note, defaultValue } = this.props;
		const { rowCount, value, isSubmitting } = this.state;
		return (
			<VStack>
				<TextareaControl
					className="form-textarea"
					ref={ this.replyInput }
					rows={ rowCount }
					value={ value }
					placeholder={ defaultValue }
					style={ { width: '100%' } }
					onClick={ this.handleClick }
					onFocus={ this.handleFocus }
					onBlur={ this.handleBlur }
					onChange={ this.handleChange }
				/>
				<Button
					variant="primary"
					title={
						value.length ? __( 'Submit reply' ) : __( 'Write your response in order to submit' )
					}
					style={ { alignSelf: 'flex-start' } }
					isBusy={ isSubmitting }
					disabled={ ! value.length }
				>
					{ __( 'Send' ) }
				</Button>
				{ /* TODO: Update suggessions */ }
				<Suggestions
					site={ note.meta.ids.site }
					onInsertSuggestion={ this.insertSuggestion }
					getContextEl={ () => this.replyInput.current }
				/>
			</VStack>
		);
	}
}

const mapStateToProps = ( state ) => ( {
	keyboardShortcutsAreEnabled: getKeyboardShortcutsEnabled( state ),
} );

const mapDispatchToProps = {
	approveNote: actions.notes.approveNote,
	selectNote: actions.ui.selectNote,
	unselectNote: actions.ui.unselectNote,
	enableKeyboardShortcuts: actions.ui.enableKeyboardShortcuts,
	disableKeyboardShortcuts: actions.ui.disableKeyboardShortcuts,
};

export default connect( mapStateToProps, mapDispatchToProps )( CommentReplyInput );
