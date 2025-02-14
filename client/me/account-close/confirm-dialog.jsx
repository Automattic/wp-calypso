import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { Dialog, Button, FormLabel, Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import FormTextInput from 'calypso/components/forms/form-text-input';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { onboardingUrl } from 'calypso/lib/paths';
import { clearStore, disablePersistence } from 'calypso/lib/user/store';
import { closeAccount } from 'calypso/state/account/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';

import './confirm-dialog.scss';

const noop = () => {};

class AccountCloseConfirmDialog extends Component {
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

	handleConfirm = async () => {
		this.props.closeAccount();
		disablePersistence();
		await clearStore();
		page( '/me/account/closed' );
	};

	handleAlternaticeActionClick = ( evt ) => {
		recordTracksEvent( 'calypso_close_account_alternative_clicked', {
			type: 'Action Link',
			label: evt.target.dataset.tracksLabel,
		} );
	};

	render() {
		const { currentUsername, siteCount, isVisible, translate } = this.props;
		const isDeleteButtonDisabled = currentUsername && this.state.inputValue !== currentUsername;

		const alternativeOptions = [
			...( siteCount > 0
				? [
						{
							englishText: "Change your site's address",
							text: translate( "Change your site's address" ),
							href: '/settings/general',
							supportLink: localizeUrl( 'https://wordpress.com/support/changing-site-address/' ),
							supportPostId: 11280,
						},
						{
							englishText: 'Delete a site',
							text: translate( 'Delete a site' ),
							href: '/settings/delete-site',
							supportLink: localizeUrl( 'https://wordpress.com/support/delete-site/' ),
							supportPostId: 14411,
						},
				  ]
				: [] ),
			{
				englishText: 'Start a new site',
				text: translate( 'Start a new site' ),
				href: onboardingUrl() + '?ref=me-account-close',
				supportLink: localizeUrl(
					'https://wordpress.com/support/create-a-blog/#adding-a-new-site-or-blog-to-an-existing-account'
				),
				supportPostId: 3991,
			},
			{
				englishText: 'Change your username',
				text: translate( 'Change your username' ),
				href: '/me/account',
				supportLink: localizeUrl( 'https://wordpress.com/support/change-your-username/' ),
				supportPostId: 2116,
			},
			{
				englishText: 'Change your password',
				text: translate( 'Change your password' ),
				href: '/me/security',
				supportLink: localizeUrl( 'https://wordpress.com/support/passwords/#change-your-password' ),
				supportPostId: 89,
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
				{ translate( 'Delete account' ) }
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
						: translate( 'Confirm account deletion' ) }
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
							spellCheck={ false }
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
										onClick={ this.handleCancel }
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
			siteCount: user && user.site_count,
		};
	},
	{
		closeAccount,
	}
)( localize( AccountCloseConfirmDialog ) );
