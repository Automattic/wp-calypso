/**
 * External dependencies
 */
import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'components/gridicon';
import { get, noop, pick } from 'lodash';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import CommentHtmlEditor from 'my-sites/comments/comment/comment-html-editor';
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import InfoPopover from 'components/info-popover';
import Popover from 'components/popover';
import PostSchedule from 'components/post-schedule';
import QuerySiteSettings from 'components/data/query-site-settings';
import { withLocalizedMoment } from 'components/localized-moment';
import { decodeEntities } from 'lib/formatting';
import {
	bumpStat,
	composeAnalytics,
	recordTracksEvent,
	withAnalytics,
} from 'state/analytics/actions';
import { editComment } from 'state/comments/actions';
import { removeNotice, successNotice } from 'state/notices/actions';
import { getSiteComment } from 'state/comments/selectors';
import getSiteSetting from 'state/selectors/get-site-setting';
import { getSelectedSiteId } from 'state/ui/selectors';

export class CommentEdit extends Component {
	static propTypes = {
		commentId: PropTypes.number,
		toggleEditMode: PropTypes.func,
	};

	state = {
		authorDisplayName: this.props.authorDisplayName || '',
		authorUrl: this.props.authorUrl || '',
		commentContent: this.props.commentContent || '',
		commentDate: this.props.commentDate || '',
		isDatePopoverVisible: false,
		storedCommentDate: '',
	};

	datePopoverButtonRef = createRef();

	toggleDatePopover = () =>
		this.setState( ( { commentDate, isDatePopoverVisible } ) => ( {
			isDatePopoverVisible: ! isDatePopoverVisible,
			storedCommentDate: isDatePopoverVisible ? '' : commentDate,
		} ) );

	cancelCommentDataValueChange = () =>
		this.setState( ( { storedCommentDate } ) => ( {
			commentDate: storedCommentDate,
			isDatePopoverVisible: false,
			storedCommentDate: '',
		} ) );

	getTimezoneForPostSchedule = () => ( {
		timezone: this.props.siteTimezone || undefined,
		gmtOffset: parseInt( this.props.siteGmtOffset, 10 ),
	} );

	setAuthorDisplayNameValue = ( event ) =>
		this.setState( { authorDisplayName: event.target.value } );

	setAuthorUrlValue = ( event ) => this.setState( { authorUrl: event.target.value } );

	setCommentContentValue = ( event, callback = noop ) =>
		this.setState( { commentContent: event.target.value }, callback );

	setCommentDateValue = ( commentDate ) =>
		this.setState( { commentDate: this.props.moment( commentDate ).format() } );

	showNotice = () => {
		const { translate } = this.props;

		this.props.removeNotice( 'comment-notice' );

		const previousCommentData = pick( this.props, [
			'authorDisplayName',
			'authorUrl',
			'commentContent',
			'commentDate',
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

		this.props.editComment(
			siteId,
			postId,
			pick( this.state, [ 'authorDisplayName', 'authorUrl', 'commentContent', 'commentDate' ] )
		);

		this.showNotice();

		toggleEditMode();
	};

	undo = ( previousCommentData ) => () => {
		const { postId, siteId } = this.props;
		this.props.editComment( siteId, postId, previousCommentData );
		this.props.removeNotice( 'comment-notice' );
	};

	render() {
		const {
			isAuthorRegistered,
			moment,
			siteGmtOffset,
			siteId,
			siteTimezone,
			toggleEditMode,
			translate,
		} = this.props;
		const {
			authorDisplayName,
			authorUrl,
			commentContent,
			commentDate,
			isDatePopoverVisible,
		} = this.state;

		return (
			<div className="comment__edit">
				{ ! siteTimezone && ! siteGmtOffset && <QuerySiteSettings siteId={ siteId } /> }
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
							disabled={ isAuthorRegistered }
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
							disabled={ isAuthorRegistered }
							id="author_url"
							onChange={ this.setAuthorUrlValue }
							value={ authorUrl }
						/>
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="date">{ translate( 'Submitted on' ) }</FormLabel>
						<Button
							className="comment__edit-date-button"
							ref={ this.datePopoverButtonRef }
							onClick={ this.toggleDatePopover }
						>
							<Gridicon icon="calendar" />
							<span>{ moment( commentDate ).format( 'lll' ) }</span>
						</Button>
						<Popover
							className="comment__edit-date-popover"
							context={ this.datePopoverButtonRef.current }
							isVisible={ isDatePopoverVisible }
							onClose={ this.cancelCommentDataValueChange }
							position="bottom"
						>
							<PostSchedule
								selectedDay={ commentDate }
								displayInputChrono={ false }
								onDateChange={ this.setCommentDateValue }
								{ ...this.getTimezoneForPostSchedule() }
							/>
							<div className="comment__edit-date-popover-buttons">
								<Button primary compact onClick={ this.toggleDatePopover }>
									{ translate( 'Change' ) }
								</Button>
								<Button compact onClick={ this.cancelCommentDataValueChange }>
									{ translate( 'Cancel' ) }
								</Button>
							</div>
						</Popover>
					</FormFieldset>

					<CommentHtmlEditor
						commentContent={ commentContent }
						onChange={ this.setCommentContentValue }
					/>

					<div className="comment__edit-buttons">
						<FormButton compact onClick={ this.submitEdit }>
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
	const comment = getSiteComment( state, siteId, commentId );
	const authorDisplayName = decodeEntities( get( comment, 'author.name' ) );

	return {
		authorDisplayName,
		authorUrl: get( comment, 'author.URL', '' ),
		commentContent: get( comment, 'raw_content' ),
		commentDate: get( comment, 'date' ),
		isAuthorRegistered: 0 !== get( comment, 'author.ID' ),
		postId: get( comment, 'post.ID' ),
		siteGmtOffset: getSiteSetting( state, siteId, 'gmt_offset' ),
		siteId,
		siteTimezone: getSiteSetting( state, siteId, 'timezone_string' ),
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
	removeNotice: ( noticeId ) => dispatch( removeNotice( noticeId ) ),
	successNotice: ( text, options ) => dispatch( successNotice( text, options ) ),
} );

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( localize( withLocalizedMoment( CommentEdit ) ) );
