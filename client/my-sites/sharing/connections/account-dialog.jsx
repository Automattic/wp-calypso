/** @format */

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
import Dialog from 'components/dialog';
import { warningNotice } from 'state/notices/actions';

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

	onClose = action => {
		const accountToConnect = this.getAccountToConnect();
		const externalUserId =
			this.props.service.multiple_external_user_ID_support && accountToConnect.isExternal
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

	onSelectedAccountChanged = account => this.setState( { selectedAccount: account } );

	constructor( props ) {
		super( props );

		this.state = {
			selectedAccount: null,
		};
	}

	componentWillReceiveProps( nextProps ) {
		// When the account dialog is closed, reset the selected account so
		// that the state doesn't leak into a future dialog
		if ( ! nextProps.visible ) {
			this.setState( { selectedAccount: null } );
		}
	}

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
				maybeConnectedAccount =>
					maybeConnectedAccount.isConnected &&
					this.areAccountsConflicting( maybeConnectedAccount, selectedAccount )
			)
		);
	}

	getAccountElements( accounts ) {
		const selectedAccount = this.getSelectedAccount();
		const defaultAccountIcon =
			this.props.service.ID === 'google_my_business' ? 'institution' : null;

		return accounts.map( account => (
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
				'Confirm this is the account you would like to authorize. Note that your posts will be automatically shared to this account.',
				{
					context: 'Sharing: Publicize connection confirmation',
				}
			);
		}

		// Otherwise, we assume that multiple connections exist for a
		// single Keyring connection, and the user must choose which
		// account to connect.
		return this.props.translate(
			'Select the account you wish to authorize. Note that your posts will be shared to the selected account automatically.',
			{
				context: 'Sharing: Publicize connection confirmation',
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

export default connect(
	null,
	{ warningNotice }
)( localize( AccountDialog ) );
