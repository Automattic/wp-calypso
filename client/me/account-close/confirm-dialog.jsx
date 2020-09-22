/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';
import { connect } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Dialog, Button } from '@automattic/components';
import Gridicon from 'components/gridicon';
import FormTextInput from 'components/forms/form-text-input';
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

	handleAlternaticeActionClick = ( evt ) => {
		recordTracksEvent( 'calypso_close_account_alternative_clicked', {
			type: 'Action Link',
			label: evt.target.dataset.tracksLabel,
		} );
	};

	render() {
		const { isVisible, currentUsername, translate } = this.props;
		const isDeleteButtonDisabled = currentUsername && this.state.inputValue !== currentUsername;

		const alternativeOptions = [
			{
				englishText: 'Start a new site',
				text: translate( 'Start a new site' ),
				href: config( 'signup_url' ),
				supportLink:
					'https://wordpress.com/support/create-a-blog/#adding-a-new-site-or-blog-to-an-existing-account',
				supportPostId: 3991,
			},
			{
				englishText: "Change your site's address",
				text: translate( "Change your site's address" ),
				href: '/settings/general',
				supportLink: 'https://wordpress.com/support/changing-site-address/',
				supportPostId: 11280,
			},
			{
				englishText: 'Change your username',
				text: translate( 'Change your username' ),
				href: '/me/account',
				supportLink: 'https://wordpress.com/support/change-your-username',
				supportPostId: 2116,
			},
			{
				englishText: 'Change your password',
				text: translate( 'Change your password' ),
				href: '/me/security',
				supportLink: 'https://wordpress.com/support/passwords/#change-your-password',
				supportPostId: 89,
			},
			{
				englishText: 'Delete a site',
				text: translate( 'Delete a site' ),
				href: '/settings/delete-site',
				supportLink: 'https://wordpress.com/support/delete-site/',
				supportPostId: 14411,
			},
		];

		const alternativeOptionsButtons = [
			<Button onClick={ this.handleCancel }>{ translate( 'Cancel' ) }</Button>,
			<Button primary onClick={ this.handleProceedingToConfirmation }>
				{ translate( 'Continue' ) }
			</Button>,
		];

		const deleteButtons = [
			<Button onClick={ this.handleCancel }>{ translate( 'Cancel' ) }</Button>,
			<Button primary scary disabled={ isDeleteButtonDisabled } onClick={ this.handleConfirm }>
				{ translate( 'Close your account' ) }
			</Button>,
		];

		return (
			<Dialog
				isVisible={ isVisible }
				buttons={ this.state.displayAlternativeOptions ? alternativeOptionsButtons : deleteButtons }
				className="account-close__confirm-dialog"
			>
				<h1 className="account-close__confirm-dialog-header">
					{ this.state.displayAlternativeOptions
						? translate( 'Are you sure?' )
						: translate( 'Confirm account closure' ) }
				</h1>
				{ ! this.state.displayAlternativeOptions && (
					<>
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
						<FormTextInput
							autoCapitalize="off"
							className="account-close__confirm-dialog-confirm-input"
							onChange={ this.handleInputChange }
							value={ this.state.inputValue }
							aria-required="true"
							id="confirmAccountCloseInput"
						/>
					</>
				) }
				{ this.state.displayAlternativeOptions && (
					<>
						<p>
							{ translate(
								"Here's a few options to try before you permanently delete your account."
							) }
						</p>

						{ alternativeOptions.map(
							( { englishText, text, href, supportLink, supportPostId } ) => (
								<div className="account-close__confirm-dialog-alternative" key={ href }>
									<Button
										href={ href }
										className="account-close__confirm-dialog-alternative-action"
										onClick={ this.handleAlternaticeActionClick }
										data-tracks-label={ englishText }
									>
										{ text }
										<Gridicon icon="chevron-right" />
									</Button>
									<InlineSupportLink
										supportPostId={ supportPostId }
										supportLink={ supportLink }
										showText={ false }
										iconSize={ 20 }
										tracksEvent="calypso_close_account_alternative_clicked"
										tracksOptions={ {
											type: 'Support Doc',
											label: englishText,
										} }
									/>
								</div>
							)
						) }
					</>
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
