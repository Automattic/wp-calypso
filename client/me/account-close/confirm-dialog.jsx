/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';
import { connect } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import { Dialog, Button } from '@automattic/components';
import FormLabel from 'components/forms/form-label';
import InlineSupportLink from 'components/inline-support-link';
import { getCurrentUser } from 'state/current-user/selectors';
import { closeAccount } from 'state/account/actions';

/**
 * Style dependencies
 */
import './confirm-dialog.scss';

class AccountCloseConfirmDialog extends React.Component {
	state = {
		displayAlternativeOptions: true,
		inputValue: '',
	};

	componentDidMount() {
		document.addEventListener( 'keydown', this.handleDialogKeydown );
	}

	componentWillUnmount() {
		document.removeEventListener( 'keydown', this.handleDialogKeydown );
	}

	handleCancel = () => {
		this.props.closeConfirmDialog();
		this.setState( { inputValue: '' } );
	};

	handleInputChange = ( event ) => {
		this.setState( { inputValue: event.target.value.toLowerCase() } );
	};

	handleDialogKeydown = ( event ) => {
		if ( event.key === 'Escape' ) {
			this.handleCancel();
		}
	};

	handleProceedingToConfirmation = () => {
		this.setState( { displayAlternativeOptions: false } );
	};

	handleConfirm = () => {
		this.props.closeAccount();
		page( '/me/account/closed' );
	};

	render() {
		const { isVisible, currentUsername, translate } = this.props;
		const isDeleteButtonDisabled = currentUsername && this.state.inputValue !== currentUsername;

		const alternativeOptionsButtons = [
			<Button onClick={ this.handleCancel }>{ translate( 'Cancel' ) }</Button>,
			<Button primary onClick={ this.handleProceedingToConfirmation }>
				{ translate( 'Proceed' ) }
			</Button>,
		];

		const deleteButtons = [
			<Button onClick={ this.handleCancel }>{ translate( 'Cancel' ) }</Button>,
			<Button primary scary disabled={ isDeleteButtonDisabled } onClick={ this.handleConfirm }>
				{ translate( 'Close your account' ) }
			</Button>,
		];

		const guideLinkText = translate( 'View a guide' );
		const actionLinkText = translate( 'Try it' );

		return (
			<Dialog
				isVisible={ isVisible }
				buttons={ this.state.displayAlternativeOptions ? alternativeOptionsButtons : deleteButtons }
				className="account-close__confirm-dialog"
			>
				<h1 className="account-close__confirm-dialog-header">
					{ this.state.displayAlternativeOptions
						? translate(
								'Before you close your account, were you looking to do the following instead?'
						  )
						: translate( 'Confirm account closure' ) }
				</h1>
				{ ! this.state.displayAlternativeOptions && (
					<Fragment>
						<FormLabel
							htmlFor="confirmAccountCloseInput"
							className="account-close__confirm-dialog-label"
						>
							{ translate(
								'Please type {{warn}}%(currentUsername)s{{/warn}} in the field below to confirm. ' +
									'Your account will then be gone forever.',
								{
									components: {
										warn: <span className="account-close__confirm-dialog-target-username" />,
									},
									args: {
										currentUsername,
									},
								}
							) }
						</FormLabel>
						<input
							autoCapitalize="off"
							className="account-close__confirm-dialog-confirm-input"
							type="text"
							onChange={ this.handleInputChange }
							value={ this.state.inputValue }
							aria-required="true"
							id="confirmAccountCloseInput"
						/>
					</Fragment>
				) }
				{ this.state.displayAlternativeOptions && (
					<div>
						<div className="account-close__confirm-dialog-alternative">
							<p>{ translate( 'Start a new site' ) }</p>
							<div className="account-close__confirm-dialog-alternative-actions">
								<InlineSupportLink
									supportPostId={ 3991 }
									supportLink="https://wordpress.com/support/create-a-blog/#adding-a-new-site-or-blog-to-an-existing-account"
									showIcon={ false }
									text={ guideLinkText }
								/>
								<a href="/jetpack/new/">{ actionLinkText }</a>
							</div>
						</div>

						<div className="account-close__confirm-dialog-alternative">
							<p>{ translate( "Change your site's address" ) }</p>
							<div className="account-close__confirm-dialog-alternative-actions">
								<InlineSupportLink
									supportPostId={ 11280 }
									supportLink="https://wordpress.com/support/changing-site-address/"
									showIcon={ false }
									text={ guideLinkText }
								/>
								<a href="/settings/general">{ actionLinkText }</a>
							</div>
						</div>

						<div className="account-close__confirm-dialog-alternative">
							<p>{ translate( 'Change your username' ) }</p>
							<div className="account-close__confirm-dialog-alternative-actions">
								<InlineSupportLink
									supportPostId={ 2116 }
									supportLink="https://wordpress.com/support/change-your-username"
									showIcon={ false }
									text={ guideLinkText }
								/>
								<a href="/me/account">{ actionLinkText }</a>
							</div>
						</div>

						<div className="account-close__confirm-dialog-alternative">
							<p>{ translate( 'Change your password' ) }</p>
							<div className="account-close__confirm-dialog-alternative-actions">
								<InlineSupportLink
									supportPostId={ 89 }
									supportLink="https://wordpress.com/support/passwords/#change-your-password"
									showIcon={ false }
									text={ guideLinkText }
								/>
								<a href="/me/security">{ actionLinkText }</a>
							</div>
						</div>

						<div className="account-close__confirm-dialog-alternative">
							<p>{ translate( 'Delete a site' ) }</p>
							<div className="account-close__confirm-dialog-alternative-actions">
								<InlineSupportLink
									supportPostId={ 14411 }
									supportLink="https://wordpress.com/support/delete-site/"
									showIcon={ false }
									text={ guideLinkText }
								/>
								<a href="/settings/delete-site">{ actionLinkText }</a>
							</div>
						</div>
					</div>
				) }
			</Dialog>
		);
	}
}

AccountCloseConfirmDialog.defaultProps = {
	onConfirm: noop,
};

export default connect(
	( state ) => {
		const user = getCurrentUser( state );

		return {
			currentUsername: user && user.username,
		};
	},
	{
		closeAccount,
	}
)( localize( AccountCloseConfirmDialog ) );
