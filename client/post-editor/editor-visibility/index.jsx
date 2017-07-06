/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';
import { includes, find } from 'lodash';
import classNames from 'classnames';
import Gridicon from 'gridicons';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import FormFieldset from 'components/forms/form-fieldset';
import FormInputValidation from 'components/forms/form-input-validation';
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';
import FormRadio from 'components/forms/form-radio';
import FormTextInput from 'components/forms/form-text-input';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import Button from 'components/button';
import Popover from 'components/popover';
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
		context: React.PropTypes.string,
		onPrivatePublish: React.PropTypes.func,
		isPrivateSite: React.PropTypes.bool,
		type: React.PropTypes.string,
		status: React.PropTypes.string,
		password: React.PropTypes.string,
		savedStatus: React.PropTypes.string,
		savedPassword: React.PropTypes.string,
		siteId: React.PropTypes.number,
		postId: React.PropTypes.number,
	},

	getInitialState() {
		return {
			showPopover: false,
			passwordIsValid: true,
			showVisibilityInfotips: false,
		};
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

	togglePopover() {
		if ( this.state.showPopover ) {
			recordStat( 'visibility-dialog-closed' );
			recordEvent( 'Closed visibility dialog' );
			this.closePopover();
		} else {
			recordStat( 'visibility-dialog-opened' );
			recordEvent( 'Opened visibility dialog' );
			this.setState( {
				showPopover: true
			} );
		}
	},

	closePopover( event ) {
		if ( this.showingAcceptDialog && event ) {
			event.preventDefault();
			return;
		}

		// In order to avoid having the click outside handler and the React onClick handler
		// both respond to a click on the label we stop propagation
		if ( event && event.type === 'click' ) {
			event.stopImmediatePropagation();
		}

		const stateChanges = {};

		if ( this.isPasswordValid() ) {
			stateChanges.showPopover = false;
		} else {
			stateChanges.passwordIsValid = false;
		}

		this.setState( stateChanges );
	},

	isPasswordValid() {
		if ( 'password' !== this.getVisibility() ) {
			return true;
		}

		const password = ReactDom.findDOMNode( this.refs.postPassword ).value.trim();

		return password.length;
	},

	renderVisibilityTip( visibility ) {
		if ( ! this.state.showVisibilityInfotips ) {
			return null;
		}

		let infotext;

		switch ( visibility ) {
			case 'public':
				infotext = this.props.translate( 'Visible to everyone.',
					{ context: 'Post visibility: info text shown when changing post visibility to public.' }
				);
				if ( this.props.isPrivateSite ) {
					infotext = this.props.translate( 'Any member of the site can view this post.',
						{ context: 'Post visibility: info text shown when changing post visibility to public on a members-only site.' }
					);
				}
				break;
			case 'private':
				infotext = this.props.translate( 'Only visible to site admins and editors.',
					{ context: 'Post visibility: info text shown when changing post visibility to private.' }
				);
				break;
			case 'password':
				infotext = this.props.translate( 'Protected with a password you choose. Only those with the password can view this post.',
					{ context: 'Post visibility: info text shown when changing post visibility to password protected.' }
				);
				break;
		}

		return (
			<FormSettingExplanation className={ visibility }>{ infotext }</FormSettingExplanation>
		);
	},

	updateVisibility( event ) {
		const { siteId, postId } = this.props;
		const defaultVisibility = 'draft' === this.props.status ? 'draft' : 'publish';
		const newVisibility = event.target.value;
		const postEdits = { status: defaultVisibility };
		let reduxPostEdits;

		switch ( newVisibility ) {
			case 'public':
				reduxPostEdits = { password: '' };
				break;

			case 'password':
				reduxPostEdits = {
					password: this.props.savedPassword || ' ',
					sticky: false,
				};
				this.setState( { passwordIsValid: true } );
				break;
		}

		recordStat( 'visibility-set-' + newVisibility );
		recordEvent( 'Changed visibility', newVisibility );
		tracks.recordEvent( 'calypso_editor_visibility_set', { context: this.props.context, visibility: newVisibility } );

		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		postActions.edit( postEdits );
		if ( reduxPostEdits ) {
			this.props.editPost( siteId, postId, reduxPostEdits );
		}
	},

	updateDropdownVisibility( newVisibility ) {
		const { siteId, postId } = this.props;
		const defaultVisibility = 'draft' === this.props.status ? 'draft' : 'publish';
		const postEdits = { status: defaultVisibility };
		let reduxPostEdits;

		switch ( newVisibility ) {
			case 'public':
				reduxPostEdits = { password: '' };
				break;

			case 'password':
				reduxPostEdits = { password: this.props.savedPassword || ' ' };
				this.setState( { passwordIsValid: true } );
				break;
		}

		recordStat( 'visibility-set-' + newVisibility );
		recordEvent( 'Changed visibility', newVisibility );
		tracks.recordEvent( 'calypso_editor_visibility_set', { context: this.props.context, visibility: newVisibility } );

		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		postActions.edit( postEdits );
		if ( reduxPostEdits ) {
			this.props.editPost( siteId, postId, reduxPostEdits );
		}
	},

	onKey( event ) {
		if ( includes( [ 'Enter', 'Escape' ], event.key ) ) {
			this.closePopover();
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
		this.setState( {
			showPopover: false
		} );
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
					onKeyUp={ this.onKey }
					onChange={ this.onPasswordChange }
					value={ value }
					isError={ isError }
					ref="postPassword"
					className={ this.state.showVisibilityInfotips ? 'is-info-open' : null }
					placeholder={ this.props.translate( 'Create password', { context: 'Editor: Create password for post' } ) }
				/>

				{ isError ? <FormInputValidation isError={ true } text={ errorMessage } /> : null }
			</div>
		);
	},

	toggleVisibilityInfotips() {
		if ( this.state.showVisibilityInfotips ) {
			recordEvent( 'InfoPopover: Visibility Closed' );
			this.setState( {
				showVisibilityInfotips: false
			} );
		} else {
			recordEvent( 'InfoPopover: Visibility Opened' );
			this.setState( {
				showVisibilityInfotips: true
			} );
		}
	},

	renderPrivacyPopover( visibility ) {
		const icons = {
			password: 'lock',
			'private': 'not-visible',
			'public': 'visible'
		};

		return (
			<Button
					compact
					borderless
					onClick={ this.togglePopover }
					ref="setVisibility"
				>
				<Gridicon icon={ icons[ visibility ] || 'visible' } /> { visibility }
				<Popover
					className="editor-visibility__popover"
					isVisible={ this.state.showPopover }
					onClose={ this.closePopover }
					position={ 'bottom left' }
					context={ this.refs && this.refs.setVisibility }
				>
					<div className="editor-visibility__dialog">
						<FormFieldset className="editor-fieldset">
							<FormLegend className="editor-fieldset__legend">
								{ this.props.translate( 'Post Visibility' ) }
								<Gridicon
									icon="info-outline"
									size={ 18 }
									className={
										classNames(
											'editor-visibility__dialog-info',
											{ is_active: this.state.showVisibilityInfotips }
										) }
									onClick={ this.toggleVisibilityInfotips }
								/>
							</FormLegend>
							<FormLabel>
								<FormRadio
									name="site-visibility"
									value="public"
									onChange={ this.updateVisibility }
									checked={ 'public' === visibility }
								/>
								<span>
									{
										this.props.isPrivateSite
										? this.props.translate(
											'Visible for members of the site',
											{ context: 'Editor: Radio label to set post visibility' }
										)
										: this.props.translate(
											'Public',
											{ context: 'Editor: Radio label to set post visible to public'
										} )
									}
								</span>
							</FormLabel>
							{ this.renderVisibilityTip( 'public' ) }

							<FormLabel>
								<FormRadio
									name="site-visibility"
									value="private"
									onChange={ this.onSetToPrivate }
									checked={ 'private' === visibility }
								/>
								<span>
								{
									this.props.translate(
										'Private',
										{ context: 'Editor: Radio label to set post to private' }
									)
								}
								</span>
							</FormLabel>
							{ this.renderVisibilityTip( 'private' ) }
							<FormLabel>
								<FormRadio
									name="site-visibility"
									value="password"
									onChange={ this.updateVisibility }
									checked={ 'password' === visibility }
								/>
								<span>
								{
									this.props.translate(
										'Password Protected',
										{ context: 'Editor: Radio label to set post to password protected' }
									)
								}
								</span>
							</FormLabel>
							{ this.renderVisibilityTip( 'password' ) }
							{ visibility === 'password' ? this.renderPasswordInput() : null }
						</FormFieldset>
					</div>
				</Popover>
			</Button>
		);
	},

	renderPrivacyDropdown( visibility ) {
		const dropdownItems = [
			{
				label: this.props.translate( 'Public', { context: 'Editor: Radio label to set post visible to public' } ),
				icon: <Gridicon icon="globe" size={ 18 } />,
				value: 'public',
				onClick: () => {
					this.updateDropdownVisibility( 'public' );
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
					this.updateDropdownVisibility( 'password' );
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
		const isDropdown = config.isEnabled( 'post-editor/delta-post-publish-flow' );
		const classes = classNames( 'editor-visibility', {
			'is-dialog-open': this.state.showPopover,
			'is-touch': touchDetect.hasTouch(),
			'is-dropdown': isDropdown,
		} );

		return (
			<div className={ classes }>
				{
					isDropdown
						? this.renderPrivacyDropdown( visibility )
						: this.renderPrivacyPopover( visibility )
				}
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
