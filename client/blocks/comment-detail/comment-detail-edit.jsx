/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextarea from 'components/forms/form-textarea';
import FormTextInput from 'components/forms/form-text-input';

export class CommentDetailEdit extends Component {
	static propTypes = {
		authorDisplayName: PropTypes.string,
		authorUrl: PropTypes.string,
		closeEditMode: PropTypes.func,
		commentContent: PropTypes.string,
		commentId: PropTypes.number,
		postId: PropTypes.number,
		updateComment: PropTypes.func,
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

	updateCommentAndCloseEditMode = () => {
		this.props.updateComment( this.props.commentId, this.props.postId, this.state );
		this.props.closeEditMode();
	};

	render() {
		const {
			closeEditMode,
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
					<FormTextInput
						onChange={ this.setAuthorDisplayNameValue }
						value={ authorDisplayName }
					/>
				</FormFieldset>

				<FormFieldset>
					<FormLabel htmlFor="author_url">
						{ translate( 'URL' ) }
					</FormLabel>
					<FormTextInput
						onChange={ this.setAuthorUrlValue }
						value={ authorUrl }
					/>
				</FormFieldset>

				<FormTextarea
					onChange={ this.setCommentContentValue }
					value={ commentContent }
				/>

				<div className="comment-detail__edit-buttons">
					<FormButton
						compact
						onClick={ this.updateCommentAndCloseEditMode }
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

export default localize( CommentDetailEdit );
