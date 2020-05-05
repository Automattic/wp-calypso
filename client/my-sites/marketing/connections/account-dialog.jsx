/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { filter, find, identity, isEqual } from 'lodash';
import { localize } from 'i18n-calypso';
import Notice from 'components/notice';

/**
 * Internal dependencies
 */
import AccountDialogAccount from './account-dialog-account';
import { Dialog } from '@automattic/components';
import { warningNotice } from 'state/notices/actions';

/**
 * Style dependencies
 */
import './account-dialog.scss';

class AccountDialog extends Component {
	static propTypes = {
		accounts: PropTypes.arrayOf( PropTypes.object ),
		disclaimerText: PropTypes.string,
		isVisible: PropTypes.bool,
		onAccountSelected: PropTypes.func,
		service: PropTypes.object,
		translate: PropTypes.func,
		warningNotice: PropTypes.func,
	};

	static defaultProps = {
		accounts: Object.freeze( [] ),
		isVisible: true,
		onAccountSelected: () => {},
		service: Object.freeze( {} ),
		translate: identity,
		warningNotice: () => {},
	};

	state = {
		selectedAccount: null,
	};

	static getDerivedStateFromProps( props, state ) {
		// When the account dialog is closed, reset the selected account so
		// that the state doesn't leak into a future dialog
		if ( ! props.isVisible && state.selectedAccount ) {
			return { selectedAccount: null };
		}

		return null;
	}

	onClose = ( action ) => {
		const accountToConnect = this.getAccountToConnect();
		const externalUserId =
			this.props.service.multiple_external_user_ID_support &&
			accountToConnect &&
			accountToConnect.isExternal
				? accountToConnect.ID
				: 0;

		if ( 'connect' === action && accountToConnect ) {
			this.props.onAccountSelected(
				this.props.service,
				accountToConnect.keyringConnectionId,
				externalUserId
			);
		} else {
			this.props.onAccountSelected();
		}
	};

	onSelectedAccountChanged = ( account ) => this.setState( { selectedAccount: account } );

	getSelectedAccount() {
		if ( this.state.selectedAccount ) {
			return this.state.selectedAccount;
		}

		// If no selection has been made, find the first unconnected account
		// from the set of available accounts
		return find( this.props.accounts, { isConnected: false } );
	}

	getAccountsByConnectedStatus( isConnected ) {
		return filter( this.props.accounts, { isConnected } );
	}

	getAccountToConnect() {
		const selectedAccount = this.getSelectedAccount();

		if ( selectedAccount && ! selectedAccount.isConnected ) {
			return selectedAccount;
		}
	}

	areAccountsConflicting( account, otherAccount ) {
		return (
			account.keyringConnectionId === otherAccount.keyringConnectionId &&
			account.ID !== otherAccount.ID
		);
	}

	isSelectedAccountConflicting() {
		const selectedAccount = this.getSelectedAccount();

		return (
			selectedAccount &&
			this.props.accounts.some(
				( maybeConnectedAccount ) =>
					maybeConnectedAccount.isConnected &&
					this.areAccountsConflicting( maybeConnectedAccount, selectedAccount )
			)
		);
	}

	getAccountElements( accounts ) {
		const selectedAccount = this.getSelectedAccount();
		const defaultAccountIcon =
			this.props.service.ID === 'google_my_business' ? 'institution' : null;

		return accounts.map( ( account ) => (
			<AccountDialogAccount
				key={ [ account.keyringConnectionId, account.ID ].join() }
				account={ account }
				selected={ isEqual( selectedAccount, account ) }
				conflicting={
					account.isConnected &&
					selectedAccount &&
					this.areAccountsConflicting( account, selectedAccount )
				}
				onChange={ this.onSelectedAccountChanged.bind( null, account ) }
				defaultIcon={ defaultAccountIcon }
			/>
		) );
	}

	getConnectedAccountsContent() {
		const connectedAccounts = this.getAccountsByConnectedStatus( true );

		if ( connectedAccounts.length ) {
			const hasConflictingAccounts = this.isSelectedAccountConflicting();

			/*eslint-disable wpcalypso/jsx-classname-namespace */
			return (
				<div className="account-dialog__connected-accounts">
					<h3 className="account-dialog__connected-accounts-heading">
						{ this.props.translate( 'Connected' ) }
					</h3>
					<ul className="account-dialog__accounts">
						{ this.getAccountElements( connectedAccounts ) }
					</ul>
					{ hasConflictingAccounts && (
						<Notice
							status="is-warning"
							icon="notice"
							text={ this.props.translate(
								'The marked connection will be replaced with your selection.'
							) }
							isCompact
						/>
					) }
				</div>
			);
			/*eslint-enable wpcalypso/jsx-classname-namespace */
		}
	}

	getDisclaimerText() {
		if ( this.props.disclaimerText ) {
			return this.props.disclaimerText;
		}

		if ( 1 === this.props.accounts.length ) {
			// If a single account is available, show a simple confirmation
			// prompt to ask the user to confirm their connection.
			return this.props.translate(
				"Is this the account you'd like to connect? All your new blog posts will be automatically shared to this account. You'll be able to change this option in the editor sidebar when you're writing a post.",
				{
					comment:
						'Sharing: asks the user to confirm if they want to share future posts to a connected social media account.',
				}
			);
		}

		// Otherwise, we assume that multiple connections exist for a
		// single Keyring connection, and the user must choose which
		// account to connect.
		return this.props.translate(
			"Select the account you'd like to connect. All your new blog posts will be automatically shared to this account. You'll be able to change this option in the editor sidebar when you're writing a post.",
			{
				comment:
					'Sharing: asks the user to confirm if they want to share future posts to a connected social media account.',
			}
		);
	}

	render() {
		const classes = classNames( 'account-dialog', {
				'single-account': 1 === this.props.accounts.length,
			} ),
			buttons = [
				{ action: 'cancel', label: this.props.translate( 'Cancel' ) },
				{ action: 'connect', label: this.props.translate( 'Connect' ), isPrimary: true },
			];

		return (
			<Dialog
				isVisible={ this.props.isVisible }
				buttons={ buttons }
				additionalClassNames={ classes }
				onClose={ this.onClose }
			>
				<h2 className="account-dialog__authorizing-service">
					{ this.props.translate( 'Connecting %(service)s', {
						args: { service: this.props.service ? this.props.service.label : '' },
						context: 'Sharing: Publicize connection confirmation',
					} ) }
				</h2>
				<p className="account-dialog__authorizing-disclaimer">{ this.getDisclaimerText() }</p>
				<ul className="account-dialog__accounts">
					{ this.getAccountElements( this.getAccountsByConnectedStatus( false ) ) }
				</ul>
				{ this.getConnectedAccountsContent() }
			</Dialog>
		);
	}
}

export default connect( null, { warningNotice } )( localize( AccountDialog ) );
