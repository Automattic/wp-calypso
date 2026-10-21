import './form.scss';
import { siteCommentsEditorQuery } from '@automattic/api-queries';
import { Button, FormInputValidation } from '@automattic/components';
import { useQuery } from '@tanstack/react-query';
import { Button as WPButton } from '@wordpress/components';
import clsx from 'clsx';
import { localize, useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component, useContext } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import UserAvatar from 'calypso/blocks/user-avatar';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import { ProtectFormGuard } from 'calypso/lib/protect-form';
import { usePostCommentActions } from 'calypso/reader/data/comments';
import { isCommentsOpen, isLoginRequiredToComment } from 'calypso/reader/post/capabilities';
import { recordAction, recordGaEvent, recordTrackForPost, getLocation } from 'calypso/reader/stats';
import { getCurrentUser, isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { registerLastActionRequiresLogin } from 'calypso/state/reader-ui/actions';
import { getCurrentRoute } from 'calypso/state/selectors/get-current-route';
import { getPreviousPath } from 'calypso/state/selectors/get-previous-path';
import AutoresizingFormTextarea from './autoresizing-form-textarea';
import CommentBlockEditor from './comment-block-editor';
import { CommentEditorContext } from './comment-editor-context';

const noop = () => {};

// The words of the editor's block markup, for the textarea it falls back to. An inert document,
// so nothing in the markup runs or loads.
const blocksToText = ( markup ) =>
	new DOMParser()
		.parseFromString(
			markup
				.replace( /<\/(p|pre|blockquote|figcaption|ul|ol)>/gi, '$&\n\n' )
				.replace( /<\/li>/gi, '$&\n' ),
			'text/html'
		)
		.body.textContent.replace( /\n{3,}/g, '\n\n' )
		.trim();

// Whether the editor's markup holds anything to post. The editor reports an empty paragraph as
// empty, but not an emptied list, quote, or code block.
const hasBlockContent = ( markup ) => {
	const body = new DOMParser().parseFromString( markup, 'text/html' ).body;
	return !! body.textContent.trim() || !! body.querySelector( 'img' );
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
	state = {
		haveFocus: false,
		editorFailed: false,
		// Bumped to start the editor over, since it keeps its own content once mounted.
		editorKey: 0,
	};

	handleCancel = () => {
		if ( this.props.parentCommentId && this.props.onReplyCancel ) {
			this.props.onReplyCancel();
			return;
		}

		this.resetCommentText();
		this.setState( ( { editorKey } ) => ( { haveFocus: false, editorKey: editorKey + 1 } ) );
	};

	handleKeyDown = ( event ) => {
		// Use Ctrl+Enter to submit comment
		if ( event.keyCode === 13 && ( event.ctrlKey || event.metaKey ) ) {
			event.preventDefault();
			this.handleSubmit( event );
		}

		// Use ESC to remove the erroneous comment placeholder and just start over
		if ( event.keyCode === 27 ) {
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
		this.setState( { haveFocus: true } );
	};

	handleEditorError = () => {
		this.setState( { editorFailed: true } );
		// The textarea cannot show block markup, so it gets the words instead.
		const text = this.getCommentText();
		if ( text.includes( '<!-- wp:' ) ) {
			this.props.onUpdateCommentText( blocksToText( text ) );
		}
	};

	handleBlur = () => {
		this.setState( { haveFocus: false } );
	};

	handleTextChange = ( event ) => {
		this.updateCommentText( event.target.value );
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

		if ( this.props.parentCommentId ) {
			this.props.replyComment( commentText, post.site_ID, post.ID, this.props.parentCommentId );
		} else {
			this.props.writeComment( commentText, post.site_ID, post.ID );
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
		return text.includes( '<!-- wp:' ) ? hasBlockContent( text ) : text.trim().length > 0;
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

		const buttonClasses = clsx( {
			'is-active': this.hasCommentText(),
			'is-visible': this.state.haveFocus || this.hasCommentText(),
		} );

		const isReply = !! this.props.parentCommentId;
		const { composer } = this.props;
		let submitLabel = translate( 'Send' );
		if ( this.props.error ) {
			submitLabel = translate( 'Resend' );
		} else if ( composer ) {
			submitLabel = translate( 'Reply' );
		}
		const placeholder = translate( 'Add a comment…' );

		// How auto expand works for the textarea is covered in this article:
		// http://alistapart.com/article/expanding-text-areas-made-elegant
		const avatar = (
			<UserAvatar
				user={ {
					avatar_URL: currentUser?.avatar_URL,
					wpcom_login: currentUser?.username,
				} }
				size={ composer ? 36 : undefined }
				hideHovercard
			/>
		);

		return (
			<form className={ clsx( 'comments__form', { 'is-composer': composer } ) }>
				<ProtectFormGuard isChanged={ this.hasCommentText() } />
				<FormFieldset>
					{ composer ? (
						<div className="comments__form-author">
							{ avatar }
							<span className="comments__form-author-name">{ currentUser?.display_name }</span>
						</div>
					) : (
						avatar
					) }
					{ this.props.editorSettings && ! this.state.editorFailed ? (
						<CommentBlockEditor
							key={ this.state.editorKey }
							settings={ this.props.editorSettings }
							value={ this.getCommentText() }
							placeholder={ placeholder }
							label={ isReply ? translate( 'Reply' ) : translate( 'Comment', { context: 'noun' } ) }
							// Settings that arrive after a focus keep it.
							takeFocus={ isReply || this.state.haveFocus }
							onChange={ this.updateCommentText }
							onError={ this.handleEditorError }
							onKeyDown={ this.handleKeyDown }
							onFocus={ this.handleFocus }
						/>
					) : (
						<AutoresizingFormTextarea
							value={ this.getCommentText() }
							placeholder={ placeholder }
							onKeyUp={ this.handleKeyUp }
							onKeyDown={ this.handleKeyDown }
							onFocus={ this.handleFocus }
							onBlur={ this.handleBlur }
							onChange={ this.handleTextChange }
							enableAutoFocus={ isReply }
							siteId={ post.site_ID }
						/>
					) }
					{ composer ? (
						<div className="comments__form-actions">
							{ ! this.props.placeholderId && (
								<WPButton
									__next40pxDefaultSize
									variant="tertiary"
									// A reply closes; a root composer only has a draft to discard.
									disabled={ ! isReply && ! this.hasCommentText() }
									onClick={ this.handleCancel }
								>
									{ translate( 'Cancel' ) }
								</WPButton>
							) }
							<WPButton
								__next40pxDefaultSize
								variant="primary"
								disabled={ ! this.hasCommentText() }
								onClick={ this.handleSubmit }
							>
								{ submitLabel }
							</WPButton>
						</div>
					) : (
						<Button
							className={ buttonClasses }
							disabled={ ! this.hasCommentText() }
							onClick={ this.handleSubmit }
						>
							{ submitLabel }
						</Button>
					) }
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

	// From withCommentsEditorSettings: the inbox's composer layout, and the editor where its site has one.
	composer: PropTypes.bool,
	editorSettings: PropTypes.object,

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
	const WithCommentsEditorSettings = ( props ) => {
		const blockEditor = useContext( CommentEditorContext );
		const query = siteCommentsEditorQuery( props.post?.site_ID );
		const { data } = useQuery( { ...query, enabled: blockEditor && query.enabled } );

		return <WrappedComponent { ...props } composer={ blockEditor } editorSettings={ data } />;
	};

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
