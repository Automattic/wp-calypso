/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';
import includes from 'lodash/includes';
import classNames from 'classnames';
import Gridicon from 'gridicons';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormInputValidation from 'components/forms/form-input-validation';
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';
import FormRadio from 'components/forms/form-radio';
import FormTextInput from 'components/forms/form-text-input';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import Button from 'components/button';
import Popover from 'components/popover';
import touchDetect from 'lib/touch-detect';
import postActions from 'lib/posts/actions';
import { recordEvent, recordStat } from 'lib/posts/stats';
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
		var stateChanges = {};

		if ( this.showingAcceptDialog && event ) {
			event.preventDefault();
			return;
		}

		// In order to avoid having the click outside handler and the React onClick handler
		// both respond to a click on the label we stop propagation
		if ( event && event.type === 'click' ) {
			event.stopImmediatePropagation();
		}

		if ( this.isPasswordValid() ) {
			stateChanges.showPopover = false;
		} else {
			stateChanges.passwordIsValid = false;
		}

		this.setState( stateChanges );
	},

	isPasswordValid() {
		var password;

		if ( 'password' !== this.getVisibility() ) {
			return true;
		}

		password = ReactDom.findDOMNode( this.refs.postPassword ).value.trim();

		return password.length;
	},

	renderVisibilityTip( visibility ) {
		var infotext;

		if ( ! this.state.showVisibilityInfotips ) {
			return null;
		}

		switch ( visibility ) {
			case 'public':
				infotext = this.translate( 'Visible to everyone.',
					{ context: 'Post visibility: info text shown when changing post visibility to public.' }
				);
				if ( this.props.isPrivateSite ) {
					infotext = this.translate( 'Any member of the site can view this post.',
						{ context: 'Post visibility: info text shown when changing post visibility to public on a members-only site.' }
					);
				}
				break;
			case 'private':
				infotext = this.translate( 'Only visible to site admins and editors.',
					{ context: 'Post visibility: info text shown when changing post visibility to private.' }
				);
				break;
			case 'password':
				infotext = this.translate( 'Protected with a password you choose. Only those with the password can view this post.',
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
				reduxPostEdits = { password: this.props.savedPassword || ' ' };
				this.setState( { passwordIsValid: true } );
				break;
		}

		recordStat( 'visibility-set-' + newVisibility );
		recordEvent( 'Changed visibility', newVisibility );

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
		this.props.editPost( siteId, postId, { password: '' } );

		recordStat( 'visibility-set-private' );
		recordEvent( 'Changed visibility', 'private' );
	},

	onPrivatePublish() {
		this.setPostToPrivate();
		this.setState( {
			showPopover: false
		} );
		setTimeout( () => this.props.onPrivatePublish(), 0 );
	},

	onSetToPrivate() {
		if ( 'private' === this.props.savedStatus ) {
			this.setPostToPrivate();
			return;
		}

		this.showingAcceptDialog = true;

		let message;

		if ( this.props.type === 'page' ) {
			message = this.translate( 'Private pages are only visible to administrators and editors of this site. Would you like to privately publish this page now?' );
		} else {
			message = this.translate( 'Private posts are only visible to administrators and editors of this site. Would you like to privately publish this post now?' );
		}

		accept( message, ( accepted ) => {
			this.showingAcceptDialog = false;
			if ( accepted ) {
				this.onPrivatePublish();
			}
		}, this.translate( 'Yes' ), this.translate( 'No' ) );
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
		var value, isError, errorMessage;

		value = this.props.password ? this.props.password.trim() : null;
		isError = ! this.state.passwordIsValid;
		errorMessage = this.translate( 'Password is empty.', { context: 'Editor: Error shown when password is empty.' } );

		return (
			<div>
				<FormTextInput
					onKeyUp={ this.onKey }
					onChange={ this.onPasswordChange }
					value={ value }
					isError={ isError }
					ref="postPassword"
					className={ this.state.showVisibilityInfotips ? 'is-info-open' : null }
					placeholder={ this.translate( 'Create password', { context: 'Editor: Create password for post' } ) }
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

	render() {
		const visibility = this.getVisibility();
		const icons = {
			password: 'lock',
			'private': 'not-visible',
			'public': 'visible'
		};
		const classes = classNames( 'editor-visibility', {
			'is-dialog-open': this.state.showPopover,
			'is-touch': touchDetect.hasTouch()
		} );

		return (
				<div className={ classes }>
					{ this.translate( 'Visibility' ) }
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
									{ this.translate( 'Post Visibility' ) }
									<Gridicon
										icon="info-outline"
										size={ 18 }
										className={ classNames( 'editor-visibility__dialog-info', { is_active: this.state.showVisibilityInfotips } ) }
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
											? this.translate( 'Visible for members of the site', { context: 'Editor: Radio label to set post visibility' } )
											: this.translate( 'Public', { context: 'Editor: Radio label to set post visible to public' } )
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
									<span>{ this.translate( 'Private', { context: 'Editor: Radio label to set post to private' } ) }</span>
								</FormLabel>
								{ this.renderVisibilityTip( 'private' ) }
								<FormLabel>
									<FormRadio
										name="site-visibility"
										value="password"
										onChange={ this.updateVisibility }
										checked={ 'password' === visibility }
									/>
									<span>{ this.translate( 'Password Protected', { context: 'Editor: Radio label to set post to password protected' } ) }</span>
								</FormLabel>
								{ this.renderVisibilityTip( 'password' ) }
								{ visibility === 'password' ? this.renderPasswordInput() : null }
							</FormFieldset>
						</div>
					</Popover>
				</Button>
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
)( EditorVisibility );
