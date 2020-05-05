/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { find, get } from 'lodash';
import classNames from 'classnames';
import Gridicon from 'components/gridicon';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormInputValidation from 'components/forms/form-input-validation';
import FormTextInput from 'components/forms/form-text-input';
import SelectDropdown from 'components/select-dropdown';
import { hasTouch } from 'lib/touch-detect';
import { recordEditorEvent, recordEditorStat } from 'state/posts/stats';
import { recordTracksEvent } from 'state/analytics/actions';
import accept from 'lib/accept';
import { editPost } from 'state/posts/actions';
import { getEditedPost, getSitePost } from 'state/posts/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import isPrivateSiteSelector from 'state/selectors/is-private-site';

/**
 * Style dependencies
 */
import './style.scss';

class EditorVisibility extends React.Component {
	static propTypes = {
		context: PropTypes.string,
		onPrivatePublish: PropTypes.func,
		isPrivateSite: PropTypes.bool,
		hasPost: PropTypes.bool,
		type: PropTypes.string,
		status: PropTypes.string,
		password: PropTypes.string,
		savedStatus: PropTypes.string,
		savedPassword: PropTypes.string,
		siteId: PropTypes.number,
		postId: PropTypes.number,
	};

	state = {
		passwordIsValid: true,
	};

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( this.props.password === nextProps.password ) {
			return;
		}

		const currentPassword = this.props.password + ''; // force to string
		const nextPassword = nextProps.password + ''; // force to string

		// visibility selection changed from public to private (without a saved password)
		const isChangeFromPublicToPrivate = currentPassword === '' && nextPassword === ' ';
		const isPasswordNotEmpty = nextPassword.trim().length > 0;

		const passwordIsValid = isChangeFromPublicToPrivate || isPasswordNotEmpty;

		this.setState( { passwordIsValid } );
	}

	getVisibility = () => {
		if ( this.props.password ) {
			return 'password';
		}

		if ( 'private' === this.props.status ) {
			return 'private';
		}

		return 'public';
	};

	recordStats = ( newVisibility ) => {
		if ( this.getVisibility() !== newVisibility ) {
			this.props.recordEditorStat( 'visibility-set-' + newVisibility );
			this.props.recordEditorEvent( 'Changed visibility', newVisibility );
			this.props.recordTracksEvent( 'calypso_editor_visibility_set', {
				context: this.props.context,
				visibility: newVisibility,
			} );
		}
	};

	updateVisibility( newVisibility ) {
		const { siteId, postId, status } = this.props;

		// This is necessary for cases when the post is changed from private
		// to another visibility since private has its own post status.
		const newStatus = status === 'draft' ? 'draft' : 'publish';

		const postEdits = { status: newStatus };

		switch ( newVisibility ) {
			case 'public':
				postEdits.password = '';
				break;

			case 'password':
				postEdits.password = this.props.savedPassword || ' ';
				// Password protected posts cannot be sticky
				postEdits.sticky = false;
				this.setState( { passwordIsValid: true } );
				break;
		}

		this.props.editPost( siteId, postId, postEdits );
		this.recordStats( newVisibility );
	}

	setPostToPrivate() {
		const { siteId, postId } = this.props;

		// Private posts cannot be sticky
		this.props.editPost( siteId, postId, {
			status: 'private',
			password: '',
			sticky: false,
		} );

		this.recordStats( 'private' );
	}

	onPrivatePublish = () => {
		this.setPostToPrivate();
		setTimeout( () => this.props.onPrivatePublish( true ), 0 );
	};

	onSetToPrivate = () => {
		if ( 'private' === this.props.savedStatus ) {
			this.setPostToPrivate();
			return;
		}

		let message;

		if ( this.props.type === 'page' ) {
			message = this.props.translate(
				'Private pages are only visible to administrators and editors of this site. ' +
					'Would you like to privately publish this page now?'
			);
		} else {
			message = this.props.translate(
				'Private posts are only visible to administrators and editors of this site. ' +
					'Would you like to privately publish this post now?'
			);
		}

		accept(
			message,
			( accepted ) => {
				if ( accepted ) {
					this.onPrivatePublish();
				}
			},
			this.props.translate( 'Yes' ),
			this.props.translate( 'No' )
		);
	};

	onPasswordChange = ( event ) => {
		const { siteId, postId } = this.props;
		let newPassword = event.target.value.trim();
		const passwordIsValid = newPassword.length > 0;

		this.setState( { passwordIsValid } );

		if ( ! passwordIsValid ) {
			newPassword = ' ';
		}

		this.props.editPost( siteId, postId, { password: newPassword } );
	};

	renderPasswordInput() {
		const value = this.props.password ? this.props.password.trim() : null;
		const isError = ! this.state.passwordIsValid;
		const errorMessage = this.props.translate( 'Password is empty.', {
			context: 'Editor: Error shown when password is empty.',
		} );

		return (
			<div>
				<FormTextInput
					autoFocus
					onChange={ this.onPasswordChange }
					onBlur={ this.onPasswordChange }
					value={ value }
					isError={ isError }
					placeholder={ this.props.translate( 'Create password', {
						context: 'Editor: Create password for post',
					} ) }
				/>

				{ isError ? <FormInputValidation isError={ true } text={ errorMessage } /> : null }
			</div>
		);
	}

	renderPrivacyDropdown = ( visibility ) => {
		const publicLabelPublicSite = this.props.translate( 'Public', {
			context: 'Editor: Radio label to set post visible to public',
		} );
		const publicLabelPrivateSite = this.props.translate( 'Site Members', {
			context:
				'Editor: Radio label to set post visible to public on a private site so that only site members can see it',
		} );
		const dropdownItems = [
			{
				label: this.props.isPrivateSite ? publicLabelPrivateSite : publicLabelPublicSite,
				icon: <Gridicon icon="globe" size={ 18 } />,
				value: 'public',
				onClick: () => {
					this.updateVisibility( 'public' );
				},
			},
			{
				label: this.props.translate( 'Admins and Editors', {
					context:
						'Editor: Radio label to set post to private so that only admins and editors can see it',
				} ),
				icon: <Gridicon icon="user" size={ 18 } />,
				value: 'private',
				onClick: this.onSetToPrivate,
			},
			{
				label: this.props.translate( 'Password Protected', {
					context: 'Editor: Radio label to set post to password protected',
				} ),
				icon: <Gridicon icon="lock" size={ 18 } />,
				value: 'password',
				onClick: () => {
					this.updateVisibility( 'password' );
				},
			},
		];
		const selectedItem = find( dropdownItems, [ 'value', visibility ] );

		return (
			<div className="editor-visibility__dropdown">
				<FormFieldset className="editor-fieldset">
					<SelectDropdown
						selectedText={
							selectedItem ? selectedItem.label : this.props.translate( 'Select an option' )
						}
						selectedIcon={ selectedItem.icon }
					>
						{ dropdownItems.map( ( option ) => (
							<SelectDropdown.Item
								selected={ option.value === visibility }
								key={ option.value }
								value={ option.value }
								onClick={ option.onClick }
								icon={ option.icon }
							>
								{ option.label }
							</SelectDropdown.Item>
						) ) }
					</SelectDropdown>
					{ 'password' === visibility ? this.renderPasswordInput() : null }
				</FormFieldset>
			</div>
		);
	};

	render() {
		// don't render anything until the edited post is loaded
		if ( ! this.props.hasPost ) {
			return null;
		}

		const visibility = this.getVisibility();
		const classes = classNames( 'editor-visibility', {
			'is-touch': hasTouch(),
		} );

		return <div className={ classes }>{ this.renderPrivacyDropdown( visibility ) }</div>;
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const postId = getEditorPostId( state );
		const currentPost = getSitePost( state, siteId, postId );
		const post = getEditedPost( state, siteId, postId );

		return {
			siteId,
			postId,
			hasPost: !! post,
			type: get( post, 'type', null ),
			status: get( post, 'status', 'draft' ),
			password: get( post, 'password', null ),
			savedStatus: get( currentPost, 'status', null ),
			savedPassword: get( currentPost, 'password', null ),
			isPrivateSite: isPrivateSiteSelector( state, siteId ),
		};
	},
	{ editPost, recordEditorStat, recordEditorEvent, recordTracksEvent }
)( localize( EditorVisibility ) );
