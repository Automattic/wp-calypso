/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import { get, noop, pick } from 'lodash';

/**
 * Internal dependencies
 */
import CommentHtmlEditor from 'my-sites/comments/comment/comment-html-editor';
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import InfoPopover from 'components/info-popover';
import { decodeEntities } from 'lib/formatting';
import {
	bumpStat,
	composeAnalytics,
	recordTracksEvent,
	withAnalytics,
} from 'state/analytics/actions';
import { editComment } from 'state/comments/actions';
import { removeNotice, successNotice } from 'state/notices/actions';
import { getSiteComment } from 'state/selectors';
import { getSiteSlug, isJetpackMinimumVersion, isJetpackSite } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

export class CommentEdit extends Component {
	static propTypes = {
		commentId: PropTypes.number,
		toggleEditMode: PropTypes.func,
	};

	state = {
		authorDisplayName: '',
		authorUrl: '',
		commentContent: '',
	};

	componentWillMount() {
		const { authorDisplayName, authorUrl, commentContent } = this.props;
		this.setState( { authorDisplayName, authorUrl, commentContent } );
	}

	setAuthorDisplayNameValue = event => this.setState( { authorDisplayName: event.target.value } );

	setAuthorUrlValue = event => this.setState( { authorUrl: event.target.value } );

	setCommentContentValue = ( event, callback = noop ) =>
		this.setState( { commentContent: event.target.value }, callback );

	showNotice = () => {
		const { translate } = this.props;

		this.props.removeNotice( 'comment-notice' );

		const previousCommentData = pick( this.props, [
			'authorDisplayName',
			'authorUrl',
			'commentContent',
		] );

		const noticeOptions = {
			button: translate( 'Undo' ),
			id: 'comment-notice',
			isPersistent: true,
			onClick: this.undo( previousCommentData ),
		};

		this.props.successNotice( translate( 'Your comment has been updated.' ), noticeOptions );
	};

	submitEdit = () => {
		const { postId, siteId, toggleEditMode } = this.props;

		this.props.editComment( siteId, postId, this.state );

		this.showNotice();

		toggleEditMode();
	};

	undo = previousCommentData => () => {
		const { postId, siteId } = this.props;
		this.props.editComment( siteId, postId, previousCommentData );
		this.props.removeNotice( 'comment-notice' );
	};

	render() {
		const {
			isAuthorRegistered,
			isEditCommentSupported,
			siteSlug,
			toggleEditMode,
			translate,
		} = this.props;
		const { authorDisplayName, authorUrl, commentContent } = this.state;

		return (
			<div className="comment__edit">
				<div className="comment__edit-header">{ translate( 'Edit Comment' ) }</div>

				<div className="comment__edit-wrapper">
					<FormFieldset>
						<FormLabel htmlFor="author">{ translate( 'Name' ) }</FormLabel>
						{ isAuthorRegistered && (
							<InfoPopover>
								{ translate( "This user is registered; the name can't be edited." ) }
							</InfoPopover>
						) }
						<FormTextInput
							disabled={ ! isEditCommentSupported || isAuthorRegistered }
							id="author"
							onChange={ this.setAuthorDisplayNameValue }
							value={ authorDisplayName }
						/>
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="author_url">{ translate( 'URL' ) }</FormLabel>
						{ isAuthorRegistered && (
							<InfoPopover>
								{ translate( "This user is registered; the URL can't be edited." ) }
							</InfoPopover>
						) }
						<FormTextInput
							disabled={ ! isEditCommentSupported || isAuthorRegistered }
							id="author_url"
							onChange={ this.setAuthorUrlValue }
							value={ authorUrl }
						/>
					</FormFieldset>

					<CommentHtmlEditor
						commentContent={ commentContent }
						disabled={ ! isEditCommentSupported }
						onChange={ this.setCommentContentValue }
					/>

					{ ! isEditCommentSupported && (
						<p className="comment__edit-jetpack-update-notice">
							<Gridicon icon="notice-outline" />
							{ translate( 'Comment editing requires a newer version of Jetpack.' ) }
							<a
								className="comment__edit-jetpack-update-notice-link"
								href={ `/plugins/jetpack/${ siteSlug }` }
							>
								{ translate( 'Update Now' ) }
							</a>
						</p>
					) }

					<div className="comment__edit-buttons">
						<FormButton compact disabled={ ! isEditCommentSupported } onClick={ this.submitEdit }>
							{ translate( 'Save' ) }
						</FormButton>
						<FormButton compact isPrimary={ false } onClick={ toggleEditMode } type="button">
							{ translate( 'Cancel' ) }
						</FormButton>
					</div>
				</div>
			</div>
		);
	}
}

const mapStateToProps = ( state, { commentId } ) => {
	const siteId = getSelectedSiteId( state );
	const isEditCommentSupported =
		! isJetpackSite( state, siteId ) || isJetpackMinimumVersion( state, siteId, '5.3' );
	const comment = getSiteComment( state, siteId, commentId );
	const authorDisplayName = decodeEntities( get( comment, 'author.name' ) );

	return {
		authorDisplayName,
		authorUrl: get( comment, 'author.URL', '' ),
		commentContent: get( comment, 'raw_content' ),
		isAuthorRegistered: 0 !== get( comment, 'author.ID' ),
		isEditCommentSupported,
		postId: get( comment, 'post.ID' ),
		siteId,
		siteSlug: getSiteSlug( state, siteId ),
	};
};

const mapDispatchToProps = ( dispatch, { commentId } ) => ( {
	editComment: ( siteId, postId, comment ) =>
		dispatch(
			withAnalytics(
				composeAnalytics(
					recordTracksEvent( 'calypso_comment_management_edit' ),
					bumpStat( 'calypso_comment_management', 'comment_updated' )
				),
				editComment( siteId, postId, commentId, comment )
			)
		),
	removeNotice: noticeId => dispatch( removeNotice( noticeId ) ),
	successNotice: ( text, options ) => dispatch( successNotice( text, options ) ),
} );

export default connect( mapStateToProps, mapDispatchToProps )( localize( CommentEdit ) );
