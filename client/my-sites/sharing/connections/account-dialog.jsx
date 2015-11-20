/**
 * External dependencies
 */
var React = require( 'react' ),
	find = require( 'lodash/collection/find' ),
	isEqual = require( 'lodash/lang/isEqual' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var Dialog = require( 'components/dialog' ),
	AccountDialogAccount = require( './account-dialog-account' ),
	Notice = require( 'notices/notice' );

module.exports = React.createClass( {
	displayName: 'AccountDialog',

	propTypes: {
		accounts: React.PropTypes.arrayOf( React.PropTypes.object ),
		onAccountSelected: React.PropTypes.func,
		service: React.PropTypes.object,
		isVisible: React.PropTypes.bool
	},

	getInitialState: function() {
		return { selectedAccount: null };
	},

	getDefaultProps: function() {
		return {
			accounts: Object.freeze( [] ),
			onAccountSelected: function() {},
			service: Object.freeze( {} ),
			isVisible: true
		};
	},

	componentWillReceiveProps: function( nextProps ) {
		// When the account dialog is closed, reset the selected account so
		// that the state doesn't leak into a future dialog
		if ( ! nextProps.visible ) {
			this.setState( { selectedAccount: null } );
		}
	},

	getSelectedAccount: function() {
		if ( this.state.selectedAccount ) {
			return this.state.selectedAccount;
		}

		// If no selection has been made, find the first unconnected account
		// from the set of available accounts
		return find( this.props.accounts, { isConnected: false } );
	},

	getAccountsByConnectedStatus: function( isConnected ) {
		return this.props.accounts.filter( function( account ) {
			return isConnected === account.isConnected;
		} );
	},

	getAccountToConnect: function() {
		var selectedAccount = this.getSelectedAccount();

		if ( selectedAccount && ! selectedAccount.isConnected ) {
			return selectedAccount;
		}
	},

	areAccountsConflicting: function( account, otherAccount ) {
		return account.keyringConnectionId === otherAccount.keyringConnectionId && account.ID !== otherAccount.ID;
	},

	isSelectedAccountConflicting: function() {
		var selectedAccount = this.getSelectedAccount();

		return selectedAccount && this.props.accounts.some( function( maybeConnectedAccount ) {
			return maybeConnectedAccount.isConnected && this.areAccountsConflicting( maybeConnectedAccount, selectedAccount );
		}, this );
	},

	onSelectedAccountChanged: function( account ) {
		this.setState( { selectedAccount: account } );
	},

	getAccountElements: function( accounts ) {
		var selectedAccount = this.getSelectedAccount();

		return accounts.map( function( account ) {
			return (
				<AccountDialogAccount
					key={ [ account.keyringConnectionId, account.ID ].join() }
					account={ account }
					selected={ isEqual( selectedAccount, account ) }
					conflicting={ account.isConnected && selectedAccount && this.areAccountsConflicting( account, selectedAccount ) }
					onChange={ this.onSelectedAccountChanged.bind( null, account ) } />
			);
		}, this );
	},

	getDisconnectWarning: function() {
		if ( this.isSelectedAccountConflicting() ) {
			return (
				<Notice
					type="message"
					status="is-warning"
					text={ this.translate( 'The connection marked {{icon/}} will be replaced with your selection.', {
						components: { icon: <span className="noticon noticon-warning" /> },
						context: 'Sharing: Publicize confirmation'
					} ) }
					isCompact={ true }
					showDismiss={ false } />
			);
		}
	},

	getConnectedAccountsContent: function() {
		var connectedAccounts = this.getAccountsByConnectedStatus( true );

		if ( connectedAccounts.length ) {
			return (
				<div className="account-dialog__connected-accounts">
					<h3 className="account-dialog__connected-accounts-heading">{ this.translate( 'Connected' ) }</h3>
					<ul className="account-dialog__accounts">
						{ this.getAccountElements( connectedAccounts ) }
					</ul>
				</div>
			);
		}
	},

	getDisclaimerText: function() {
		if ( 1 === this.props.accounts.length ) {
			// If a single account is available, show a simple confirmation
			// prompt to ask the user to confirm their connection.
			return this.translate( 'Confirm this is the account you would like to authorize. Note that your posts will be automatically shared to this account.', {
				context: 'Sharing: Publicize connection confirmation'
			} );
		} else {
			// Otherwise, we assume that multiple connections exist for a
			// single Keyring connection, and the user must choose which
			// account to connect.
			return this.translate( 'Select the account you wish to authorize. Note that your posts will be shared to the selected account automatically.', {
				context: 'Sharing: Publicize connection confirmation'
			} );
		}
	},

	onClose: function( action ) {
		var accountToConnect = this.getAccountToConnect();

		if ( 'connect' === action && accountToConnect ) {
			this.props.onAccountSelected( this.props.service, accountToConnect.keyringConnectionId, accountToConnect.ID );
		} else {
			this.props.onAccountSelected();
		}
	},

	render: function() {
		var classes = classNames( 'account-dialog', {
			'single-account': 1 === this.props.accounts.length
		} ), buttons;

		buttons = [
			{ action: 'cancel', label: this.translate( 'Cancel' ) },
			{ action: 'connect', label: this.translate( 'Connect' ), isPrimary: true }
		];

		return (
			<Dialog isVisible={ this.props.isVisible } buttons={ buttons } additionalClassNames={ classes } onClose={ this.onClose }>
				<h2 className="account-dialog__authorizing-service">
					{ this.translate( 'Connecting %(service)s', {
						args: { service: this.props.service ? this.props.service.label : '' },
						context: 'Sharing: Publicize connection confirmation'
					} ) }
				</h2>
				<p className="account-dialog__authorizing-disclaimer">{ this.getDisclaimerText() }</p>
				<ul className="account-dialog__accounts">{ this.getAccountElements( this.getAccountsByConnectedStatus( false ) ) }</ul>
				{ this.getConnectedAccountsContent() }
				{ this.getDisconnectWarning() }
			</Dialog>
		);
	}
} );
