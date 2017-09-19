import ReactDom from 'react-dom';

/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';
import { find } from 'lodash';
import classNames from 'classnames';
import Gridicon from 'gridicons';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormInputValidation from 'components/forms/form-input-validation';
import FormTextInput from 'components/forms/form-text-input';
import SelectDropdown from 'components/select-dropdown';
import DropdownItem from 'components/select-dropdown/item';
import touchDetect from 'lib/touch-detect';
import postActions from 'lib/posts/actions';
import { recordEvent, recordStat } from 'lib/posts/stats';
import { tracks } from 'lib/analytics';
import accept from 'lib/accept';
import { editPost } from 'state/posts/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';

const EditorVisibility = React.createClass( {
	showingAcceptDialog: false,

	getDefaultProps() {
		return {
			isPrivateSite: false
		};
	},

	propTypes: {
		context: PropTypes.string,
		onPrivatePublish: PropTypes.func,
		isPrivateSite: PropTypes.bool,
		type: PropTypes.string,
		status: PropTypes.string,
		password: PropTypes.string,
		savedStatus: PropTypes.string,
		savedPassword: PropTypes.string,
		siteId: PropTypes.number,
		postId: PropTypes.number,
	},

	getInitialState() {
		return {
			passwordIsValid: true,
		};
	},

	componentWillReceiveProps( nextProps ) {
		if ( this.props.password === nextProps.password ) {
			return;
		}

		const currentPassword = this.props.password + ''; // force to string
		const nextPassword = nextProps.password + '';     // force to string

		// visibility selection changed from public to private (without a saved password)
		const isChangeFromPublicToPrivate = currentPassword === '' && nextPassword === ' ';
		const isPasswordNotEmpty = nextPassword.trim().length > 0;

		const passwordIsValid = isChangeFromPublicToPrivate || isPasswordNotEmpty;

		this.setState( { passwordIsValid } );
	},

	getVisibility() {
		if ( this.props.password ) {
			return 'password';
		}

		if ( 'private' === this.props.status ) {
			return 'private';
		}

		return 'public';
	},

	isPasswordValid() {
		if ( 'password' !== this.getVisibility() ) {
			return true;
		}

		const password = ReactDom.findDOMNode( this.refs.postPassword ).value.trim();

		return password.length;
	},

	updatePostStatus() {
		const defaultVisibility = 'draft' === this.props.status ? 'draft' : 'publish';
		const postEdits = { status: defaultVisibility };

		postActions.edit( postEdits );
	},

	updateVisibility( newVisibility ) {
		const { siteId, postId } = this.props;
		let reduxPostEdits;

		switch ( newVisibility ) {
			case 'public':
				reduxPostEdits = { password: '' };
				break;

			case 'password':
				reduxPostEdits = {
					password: this.props.savedPassword || ' ',
					// Password protected posts cannot be sticky
					sticky: false,
				};
				this.setState( { passwordIsValid: true } );
				break;
		}

		recordStat( 'visibility-set-' + newVisibility );
		recordEvent( 'Changed visibility', newVisibility );
		tracks.recordEvent( 'calypso_editor_visibility_set', { context: this.props.context, visibility: newVisibility } );

		// This is necessary for cases when the post is changed from private to another visibility
		// since private has its own post status.
		this.updatePostStatus();

		if ( reduxPostEdits ) {
			this.props.editPost( siteId, postId, reduxPostEdits );
		}
	},

	setPostToPrivate() {
		const { siteId, postId } = this.props;
		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		postActions.edit( {
			status: 'private'
		} );

		// Private posts cannot be sticky
		this.props.editPost( siteId, postId, {
			password: '',
			sticky: false
		} );

		recordStat( 'visibility-set-private' );
		recordEvent( 'Changed visibility', 'private' );
		tracks.recordEvent( 'calypso_editor_visibility_set', { context: this.props.context, visibility: 'private' } );
	},

	onPrivatePublish() {
		this.setPostToPrivate();
		setTimeout( () => this.props.onPrivatePublish( true ), 0 );
	},

	onSetToPrivate() {
		if ( 'private' === this.props.savedStatus ) {
			this.setPostToPrivate();
			return;
		}

		this.showingAcceptDialog = true;

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

		accept( message, ( accepted ) => {
			this.showingAcceptDialog = false;
			if ( accepted ) {
				this.onPrivatePublish();
			}
		}, this.props.translate( 'Yes' ), this.props.translate( 'No' ) );
	},

	onPasswordChange( event ) {
		const { siteId, postId } = this.props;
		let newPassword = event.target.value.trim();
		const passwordIsValid = newPassword.length > 0;

		this.setState( { passwordIsValid } );

		if ( ! passwordIsValid ) {
			newPassword = ' ';
		}

		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		this.props.editPost( siteId, postId, { password: newPassword } );
	},

	renderPasswordInput() {
		const value = this.props.password ? this.props.password.trim() : null;
		const isError = ! this.state.passwordIsValid;
		const errorMessage = this.props.translate( 'Password is empty.', { context: 'Editor: Error shown when password is empty.' } );

		return (
			<div>
				<FormTextInput
					autoFocus
					onKeyUp={ this.onKey }
					onChange={ this.onPasswordChange }
					onBlur={ this.onPasswordChange }
					value={ value }
					isError={ isError }
					ref="postPassword"
					placeholder={ this.props.translate( 'Create password', { context: 'Editor: Create password for post' } ) }
				/>

				{ isError ? <FormInputValidation isError={ true } text={ errorMessage } /> : null }
			</div>
		);
	},

	renderPrivacyDropdown( visibility ) {
		const dropdownItems = [
			{
				label: this.props.translate( 'Public', { context: 'Editor: Radio label to set post visible to public' } ),
				icon: <Gridicon icon="globe" size={ 18 } />,
				value: 'public',
				onClick: () => {
					this.updateVisibility( 'public' );
				}
			},
			{
				label: this.props.translate( 'Private', { context: 'Editor: Radio label to set post to private' } ),
				icon: <Gridicon icon="user" size={ 18 } />,
				value: 'private',
				onClick: this.onSetToPrivate
			},
			{
				label: this.props.translate( 'Password Protected', { context: 'Editor: Radio label to set post to password protected' } ),
				icon: <Gridicon icon="lock" size={ 18 } />,
				value: 'password',
				onClick: () => {
					this.updateVisibility( 'password' );
				}
			},
		];
		const selectedItem = find( dropdownItems, [ 'value', visibility ] );

		return (
			<div className="editor-visibility__dropdown">
				<FormFieldset className="editor-fieldset">
					<SelectDropdown
						selectedText={ selectedItem ? selectedItem.label : this.props.translate( 'Select an option' ) }
						selectedIcon={ selectedItem.icon }
					>
						{ dropdownItems.map( option =>
							<DropdownItem
								selected={ option.value === visibility }
								key={ option.value }
								value={ option.value }
								onClick={ option.onClick }
								icon={ option.icon }
							>
								{ option.label }
							</DropdownItem>
						) }
					</SelectDropdown>
					{ 'password' === visibility ? this.renderPasswordInput() : null }
				</FormFieldset>
			</div>
		);
	},

	render() {
		const visibility = this.getVisibility();
		const classes = classNames( 'editor-visibility', {
			'is-touch': touchDetect.hasTouch(),
		} );

		return (
			<div className={ classes }>
				{ this.renderPrivacyDropdown( visibility ) }
			</div>
		);
	}

} );

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const postId = getEditorPostId( state );

		return {
			siteId,
			postId
		};
	},
	{ editPost }
)( localize( EditorVisibility ) );
