import './form.scss';
import { commentsEditorQuery } from '@automattic/api-queries';
import { Button, FormInputValidation } from '@automattic/components';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { localize, useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component, createRef, useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import UserAvatar from 'calypso/blocks/user-avatar';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import { ProtectFormGuard } from 'calypso/lib/protect-form';
import { usePostCommentActions } from 'calypso/reader/data/comments';
import {
	isCommentHtmlOnly,
	isCommentsOpen,
	isLoginRequiredToComment,
} from 'calypso/reader/post/capabilities';
import { recordAction, recordGaEvent, recordTrackForPost, getLocation } from 'calypso/reader/stats';
import { getCurrentUser, isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { registerLastActionRequiresLogin } from 'calypso/state/reader-ui/actions';
import { getCurrentRoute } from 'calypso/state/selectors/get-current-route';
import { getPreviousPath } from 'calypso/state/selectors/get-previous-path';
import AutoresizingFormTextarea from './autoresizing-form-textarea';
import CommentBlockEditor from './comment-block-editor';
import { CommentEditorContext } from './comment-editor-context';
import { blocksToHtml, blocksToText, hasBlockContent } from './comment-markup';
import { isBlockMarkup, loadCommentEditor } from './load-comment-editor';
import { usePageSettled } from './use-page-settled';

const noop = () => {};

// Past the Reader's own first page of posts and images, for a writer who never points at a box.
const FALLBACK_PRELOAD_DELAY = 5000;

// A writer who asked for less data, or can't spare half a megabyte, loads the editor on focus.
const isConstrainedConnection = () => {
	const connection = typeof navigator !== 'undefined' ? navigator.connection : undefined;
	return !! connection?.saveData || /2g$/.test( connection?.effectiveType ?? '' );
};

function PostCommentFormError( { type } ) {
	const translate = useTranslate();

	const message =
		type === 'comment_duplicate'
			? translate( "Duplicate comment detected. It looks like you've already said that!" )
			: translate( 'Sorry - there was a problem posting your comment.' );

	return <FormInputValidation isError text={ message } />;
}

class PostCommentForm extends Component {
	static contextType = CommentEditorContext;

	form = createRef();

	state = {
		haveFocus: false,
		// The plain textarea stands in until the first focus.
		editorOpen: false,
		// The form row's height with the textarea, which the editor grows from and shrinks back to.
		openFrom: undefined,
		editorClosing: false,
		editorFailed: false,
		// Bumped to start the editor over, since it keeps its own content once mounted.
		editorKey: 0,
	};

	// A fresh editor, or the textarea again: the editor keeps its own content once mounted.
	resetEditor( callback ) {
		this.setState(
			( { editorKey } ) => ( {
				haveFocus: false,
				editorOpen: false,
				editorClosing: false,
				editorKey: editorKey + 1,
			} ),
			callback
		);
	}

	handleKeyDown = ( event ) => {
		// Use Ctrl+Enter to submit comment
		if ( event.keyCode === 13 && ( event.ctrlKey || event.metaKey ) ) {
			event.preventDefault();
			this.handleSubmit( event );
		}

		if ( event.keyCode === 27 ) {
			// Escape closes an empty editor, as clicking away does, unless it's closing one of the
			// editor's menus. Focus goes back to the textarea, so the keyboard doesn't lose its place.
			if (
				this.props.editorSettings &&
				this.state.editorOpen &&
				this.canCloseEditor() &&
				! event.target.closest?.( '.components-popover' )
			) {
				this.escaped = true;
				this.setState( { editorClosing: true } );
			}

			// Use ESC to remove the erroneous comment placeholder and just start over
			if ( this.props.placeholderId ) {
				// sync the text to the upper level so it won't be lost
				this.props.onUpdateCommentText( this.getCommentText() );
				// remove the comment
				this.props.deleteComment(
					this.props.post.site_ID,
					this.props.post.ID,
					this.props.placeholderId
				);
			}
		}
	};

	handleFocus = () => {
		this.setState( { haveFocus: true, editorOpen: true, editorClosing: false } );
	};

	openEditorFrom( textarea ) {
		this.setState( { openFrom: textarea.closest( 'fieldset' )?.offsetHeight } );
		this.handleFocus();
	}

	handleTextareaFocus = ( event ) => {
		// Back from Escape: the textarea holds focus until the writer types or clicks.
		if ( this.escaped ) {
			this.escaped = false;
			return;
		}
		this.openEditorFrom( event.target );
	};

	// A click on the textarea that already has focus, which fires no focus event.
	handleTextareaPointerDown = ( event ) => {
		if ( this.props.editorSettings && event.target === event.target.ownerDocument.activeElement ) {
			this.openEditorFrom( event.target );
		}
	};

	handleEditorError = () => {
		this.setState( { editorFailed: true } );
		// The textarea cannot show block markup, so it gets the words instead.
		const text = this.getCommentText();
		if ( isBlockMarkup( text ) ) {
			this.props.onUpdateCommentText( blocksToText( text ) );
		}
	};

	handleBlur = () => {
		this.setState( { haveFocus: false } );
	};

	// An empty editor shrinks back to the textarea.
	canCloseEditor() {
		return ! this.props.parentCommentId && ! this.hasCommentText();
	}

	handleEditorBlur = () => {
		if ( this.canCloseEditor() ) {
			this.setState( { editorClosing: true } );
		}
	};

	handleEditorClosed = () => {
		// An emptied list, quote, or code block is still markup, which would keep the editor up.
		this.resetCommentText();
		this.resetEditor( () => {
			if ( this.escaped ) {
				// Straight to its focused border, not a fade in from the unfocused one.
				const textarea = this.form.current?.querySelector( 'textarea' );
				if ( textarea ) {
					textarea.style.transition = 'none';
					textarea.focus();
					// Two frames: the focused border has been drawn by the second.
					requestAnimationFrame( () =>
						requestAnimationFrame( () => ( textarea.style.transition = '' ) )
					);
				}
				this.escaped = false;
			}
		} );
	};

	handleTextChange = ( event ) => {
		this.updateCommentText( event.target.value );
		// Typing after Escape brings the editor back, with what was typed.
		if ( this.props.editorSettings && ! this.state.editorOpen ) {
			this.openEditorFrom( event.target );
		}
	};

	updateCommentText = ( value ) => {
		if ( ! this.props.isLoggedIn ) {
			return this.props.registerLastActionRequiresLogin( {
				type: 'comment',
				siteId: this.props.post.site_ID,
				postId: this.props.post.ID,
				commentId: this.props.placeholderId,
			} );
		}
		// Update the comment text in the container's state
		this.props.onUpdateCommentText( value );
	};

	handleSubmit = ( event ) => {
		event.preventDefault();

		const post = this.props.post;
		const commentText = this.getCommentText().trim();

		if ( ! this.hasCommentText() ) {
			this.resetCommentText(); // Clean up any newlines
			return false;
		}

		// Do not submit form if the user is not logged in
		if ( ! this.props.isLoggedIn ) {
			return this.props.registerLastActionRequiresLogin( {
				type: 'comment-submit',
				siteId: this.props.post.site_ID,
				postId: this.props.post.ID,
				commentId: this.props.placeholderId,
				commentText: commentText,
			} );
		}

		if ( this.props.placeholderId ) {
			this.props.deleteComment( post.site_ID, post.ID, this.props.placeholderId );
		}

		// A site without block comments doesn't render the editor's block markup, so it gets plain
		// HTML. A textarea's words go as typed.
		const content =
			this.props.editorSettings && isCommentHtmlOnly( post ) && isBlockMarkup( commentText )
				? blocksToHtml( commentText )
				: commentText;

		if ( this.props.parentCommentId ) {
			this.props.replyComment( content, post.site_ID, post.ID, this.props.parentCommentId );
		} else {
			this.props.writeComment( content, post.site_ID, post.ID );
		}

		recordAction( 'posted_comment' );
		recordGaEvent( 'Clicked Post Comment Button' );

		const locationId = getLocation( this.props.currentPath );
		const isSinglePost = locationId === 'single_post';

		const options = {
			// Override the pathname to the previous path if the current path is a single post
			pathnameOverride: isSinglePost ? this.props.previousPath : undefined,
		};

		recordTrackForPost(
			'calypso_reader_article_commented_on',
			post,
			{
				parent_post_id: this.props.parentCommentId ? this.props.parentCommentId : undefined,
				is_inline_comment: this.props.isInlineComment,
			},
			options
		);

		this.resetCommentText();
		this.resetEditor();

		// Resets the active reply comment in PostCommentList
		this.props.onCommentSubmit();

		return true;
	};

	resetCommentText() {
		// Update the comment text in the container's state
		this.props.onUpdateCommentText( '' );
	}

	getCommentText() {
		return this.props.commentText ?? '';
	}

	hasCommentText() {
		const text = this.getCommentText();
		return isBlockMarkup( text ) ? hasBlockContent( text ) : text.trim().length > 0;
	}

	render() {
		const { post, error, errorType, translate, currentUser } = this.props;

		// Don't display the form if comments are closed
		if ( post && ! isCommentsOpen( post ) ) {
			// If we already have some comments, show a 'comments closed message'
			if ( post.discussion?.comment_count > 0 ) {
				return <p className="comments__form-closed">{ translate( 'Comments closed.' ) }</p>;
			}

			return null;
		}

		// If comments require registration, show a prompt to visit the post instead of the form
		if ( post && isLoginRequiredToComment( post ) ) {
			return (
				<p className="comments__form-closed">
					{ translate(
						'This site requires registration to comment. {{a}}Visit the original post{{/a}} to log in or create an account and join the conversation.',
						{
							components: {
								a: <a href={ post.URL } target="_blank" rel="noopener noreferrer" />,
							},
						}
					) }
				</p>
			);
		}

		const isReply = !! this.props.parentCommentId;
		const hasText = this.hasCommentText();
		const showEditor =
			this.props.editorSettings &&
			! this.state.editorFailed &&
			( isReply || this.state.editorOpen || isBlockMarkup( this.getCommentText() ) );

		// Under the editor, Send shows once there's something to send.
		const buttonClasses = clsx( {
			'is-active': hasText,
			'is-visible': hasText || ( this.state.haveFocus && ! showEditor ),
			'is-reserved': showEditor,
		} );
		const submitLabel = this.props.error ? translate( 'Resend' ) : translate( 'Send' );
		const placeholder = translate( 'Add a comment…' );

		// How auto expand works for the textarea is covered in this article:
		// http://alistapart.com/article/expanding-text-areas-made-elegant
		const avatar = (
			<UserAvatar
				user={ {
					avatar_URL: currentUser?.avatar_URL,
					wpcom_login: currentUser?.username,
				} }
				hideHovercard
			/>
		);

		return (
			<form
				ref={ this.form }
				className={ clsx( 'comments__form', { 'has-block-editor': this.context } ) }
				onPointerEnter={ this.props.onIntent }
				onFocus={ this.props.onIntent }
			>
				<ProtectFormGuard isChanged={ hasText } />
				<FormFieldset>
					{ avatar }
					{ showEditor ? (
						<CommentBlockEditor
							key={ this.state.editorKey }
							settings={ this.props.editorSettings }
							value={ this.getCommentText() }
							placeholder={ placeholder }
							label={ isReply ? translate( 'Reply' ) : translate( 'Comment', { context: 'noun' } ) }
							// Settings that arrive after a focus keep it.
							takeFocus={ isReply || this.state.haveFocus }
							openFrom={ this.state.openFrom }
							closing={ this.state.editorClosing }
							onClosed={ this.handleEditorClosed }
							onChange={ this.updateCommentText }
							onError={ this.handleEditorError }
							onKeyDown={ this.handleKeyDown }
							onFocus={ this.handleFocus }
							onBlur={ this.handleEditorBlur }
						/>
					) : (
						<AutoresizingFormTextarea
							value={ this.getCommentText() }
							placeholder={ placeholder }
							onKeyDown={ this.handleKeyDown }
							onFocus={ this.handleTextareaFocus }
							onPointerDown={ this.handleTextareaPointerDown }
							onBlur={ this.handleBlur }
							onChange={ this.handleTextChange }
							enableAutoFocus={ isReply }
							siteId={ post.site_ID }
						/>
					) }
					<Button className={ buttonClasses } disabled={ ! hasText } onClick={ this.handleSubmit }>
						{ submitLabel }
					</Button>
					{ error && <PostCommentFormError type={ errorType } /> }
				</FormFieldset>
			</form>
		);
	}
}

PostCommentForm.propTypes = {
	post: PropTypes.object.isRequired,
	parentCommentId: PropTypes.number,
	placeholderId: PropTypes.string, // can only be 'placeholder-123'
	commentText: PropTypes.string,
	onUpdateCommentText: PropTypes.func.isRequired,
	onCommentSubmit: PropTypes.func,
	isInlineComment: PropTypes.bool,
	isLogedIn: PropTypes.bool,

	onReplyCancel: PropTypes.func,

	// From withCommentsEditorSettings, inside the inbox only.
	editorSettings: PropTypes.object,
	onIntent: PropTypes.func,

	// connect()ed props:
	currentUser: PropTypes.object,
	writeComment: PropTypes.func.isRequired,
	deleteComment: PropTypes.func.isRequired,
	replyComment: PropTypes.func.isRequired,
};

PostCommentForm.defaultProps = {
	commentText: '',
	onCommentSubmit: noop,
};

const withPostCommentActions = ( WrappedComponent ) => {
	const WithPostCommentActions = ( props ) => {
		const actions = usePostCommentActions();

		return <WrappedComponent { ...props } { ...actions } />;
	};

	WithPostCommentActions.displayName = `withPostCommentActions(${
		WrappedComponent.displayName || WrappedComponent.name || 'Component'
	})`;

	return WithPostCommentActions;
};

const withCommentsEditorSettings = ( WrappedComponent ) => {
	const WithEditor = ( props ) => {
		const settled = usePageSettled();
		// A pointer over the form, or focus in it: a writer on their way in.
		const [ wanted, setWanted ] = useState( false );
		const { data } = useQuery( { ...commentsEditorQuery(), enabled: settled || wanted } );

		// The editor downloads ahead of the first focus, so it's ready when someone clicks in.
		useEffect( () => {
			if ( ! data || ( ! wanted && isConstrainedConnection() ) ) {
				return;
			}
			const timer = setTimeout(
				() => loadCommentEditor( data ).catch( noop ),
				wanted ? 0 : FALLBACK_PRELOAD_DELAY
			);
			return () => clearTimeout( timer );
		}, [ data, wanted ] );

		return (
			<WrappedComponent
				{ ...props }
				editorSettings={ data }
				onIntent={ wanted ? undefined : () => setWanted( true ) }
			/>
		);
	};

	// Only the Conversations inbox gets the editor until it's released to the whole Reader.
	const WithCommentsEditorSettings = ( props ) =>
		useContext( CommentEditorContext ) ? (
			<WithEditor { ...props } />
		) : (
			<WrappedComponent { ...props } />
		);

	WithCommentsEditorSettings.displayName = `withCommentsEditorSettings(${
		WrappedComponent.displayName || WrappedComponent.name || 'Component'
	})`;

	return WithCommentsEditorSettings;
};

export default compose(
	connect(
		( state ) => ( {
			currentUser: getCurrentUser( state ),
			isLoggedIn: isUserLoggedIn( state ),
			previousPath: getPreviousPath( state ),
			currentPath: getCurrentRoute( state ),
		} ),
		{ registerLastActionRequiresLogin }
	),
	withPostCommentActions,
	withCommentsEditorSettings,
	localize
)( PostCommentForm );
