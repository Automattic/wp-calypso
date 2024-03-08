import { Button, Popover, FormLabel, Gridicon } from '@automattic/components';
import { Spinner } from '@wordpress/components';
import { localize } from 'i18n-calypso';
import { get, pick } from 'lodash';
import PropTypes from 'prop-types';
import { Component, createRef } from 'react';
import { connect } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import QuerySiteSettings from 'calypso/components/data/query-site-settings';
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
import InfoPopover from 'calypso/components/info-popover';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import PostSchedule from 'calypso/components/post-schedule';
import { decodeEntities } from 'calypso/lib/formatting';
import CommentHtmlEditor from 'calypso/my-sites/comments/comment/comment-html-editor';
import {
	bumpStat,
	composeAnalytics,
	recordTracksEvent,
	withAnalytics,
} from 'calypso/state/analytics/actions';
import { editComment } from 'calypso/state/comments/actions';
import { getSiteComment } from 'calypso/state/comments/selectors';
import { removeNotice, successNotice } from 'calypso/state/notices/actions';
import getSiteSetting from 'calypso/state/selectors/get-site-setting';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { hasBlocks } from './utils';

const noop = () => {};

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
		// Cache whether the comment has blocks. We don't want change that mid-typing (in case the user adds `<!-- wp:`).
		originalCommentHasBlocks: hasBlocks( this.props.commentContent ),
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

	setCommentContentValue = ( event, callback = noop ) => {
		const commentContent = typeof event === 'string' ? event : event.target.value;
		this.setState( { commentContent }, callback );
	};

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
			originalCommentHasBlocks,
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
					{ originalCommentHasBlocks ? (
						<AsyncLoad
							require="./comment-block-editor"
							placeholder={ <Spinner style={ { margin: 20 } } /> }
							commentContent={ commentContent }
							onChange={ this.setCommentContentValue }
						/>
					) : (
						<CommentHtmlEditor
							onChange={ this.setCommentContentValue }
							commentContent={ commentContent }
						/>
					) }

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
