/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormTextarea from 'components/forms/form-textarea';
import InfoPopover from 'components/info-popover';
import { getSiteSlug } from 'state/sites/selectors';

export class CommentDetailEdit extends Component {
	static propTypes = {
		authorDisplayName: PropTypes.string,
		authorUrl: PropTypes.string,
		closeEditMode: PropTypes.func,
		commentContent: PropTypes.string,
		commentId: PropTypes.number,
		editComment: PropTypes.func,
		isAuthorRegistered: PropTypes.bool,
		isEditCommentSupported: PropTypes.bool,
		postId: PropTypes.number,
		siteId: PropTypes.number,
		siteSlug: PropTypes.string,
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

	setCommentContentValue = event => this.setState( { commentContent: event.target.value } );

	editCommentAndCloseEditMode = () => {
		const { authorDisplayName, authorUrl, commentContent } = this.props;
		this.props.editComment( this.props.commentId, this.props.postId, this.state, { authorDisplayName, authorUrl, commentContent } );
		this.props.closeEditMode();
	};

	render() {
		const {
			closeEditMode,
			isAuthorRegistered,
			isEditCommentSupported,
			siteSlug,
			translate,
		} = this.props;
		const {
			authorDisplayName,
			authorUrl,
			commentContent,
		} = this.state;

		return (
			<div className="comment-detail__edit">
				<FormFieldset>
					<FormLabel htmlFor="author">
						{ translate( 'Name' ) }
					</FormLabel>
					{ isAuthorRegistered &&
						<InfoPopover>
							{ translate( 'This user is registered, the name can\'t be edited.' ) }
						</InfoPopover>
					}
					<FormTextInput
						disabled={ ! isEditCommentSupported || isAuthorRegistered }
						onChange={ this.setAuthorDisplayNameValue }
						value={ authorDisplayName }
					/>
				</FormFieldset>

				<FormFieldset>
					<FormLabel htmlFor="author_url">
						{ translate( 'URL' ) }
					</FormLabel>
					{ isAuthorRegistered &&
						<InfoPopover>
							{ translate( 'This user is registered, the URL can\'t be edited.' ) }
						</InfoPopover>
					}
					<FormTextInput
						disabled={ ! isEditCommentSupported || isAuthorRegistered }
						onChange={ this.setAuthorUrlValue }
						value={ authorUrl }
					/>
				</FormFieldset>

				<FormTextarea
					disabled={ ! isEditCommentSupported }
					onChange={ this.setCommentContentValue }
					value={ commentContent }
				/>

				{ ! isEditCommentSupported &&
					<p className="comment-detail__edit-jetpack-update-notice">
						<Gridicon icon="notice-outline" />
						{ translate( 'Comment editing requires a newer version of Jetpack.' ) }
						<a
							className="comment-detail__edit-jetpack-update-notice-link"
							href={ `/plugins/jetpack/${ siteSlug }` }
						>
							{ translate( 'Update Now' ) }
						</a>
					</p>
				}

				<div className="comment-detail__edit-buttons">
					<FormButton
						compact
						disabled={ ! isEditCommentSupported }
						onClick={ this.editCommentAndCloseEditMode }
					>
						{ translate( 'Save' ) }
					</FormButton>
					<FormButton
						compact
						isPrimary={ false }
						onClick={ closeEditMode }
						type="button"
					>
						{ translate( 'Cancel' ) }
					</FormButton>
				</div>
			</div>
		);
	}
}

const mapStateToProps = ( state, { siteId } ) => ( {
	siteSlug: getSiteSlug( state, siteId ),
} );

export default connect( mapStateToProps )( localize( CommentDetailEdit ) );
