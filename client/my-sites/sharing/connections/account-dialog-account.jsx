/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import Gridicon from 'gridicons';

const AccountDialogAccount = ( { account, conflicting, onChange, selected } ) => {
	const classes = classNames( 'account-dialog-account', {
		'is-connected': account.isConnected,
		'is-conflict': conflicting,
	} );

	return (
		<li className={ classes }>
			<label className="account-dialog-account__label">
				{ conflicting && <Gridicon icon="notice" /> }
				{ ! account.isConnected &&
					<input type="radio" onChange={ onChange } checked={ selected } className="account-dialog-account__input" /> }
				{ account.picture &&
					<img src={ account.picture } alt={ account.name } className="account-dialog-account__picture" /> }
				<span className="account-dialog-account__name">{ account.name }</span>
			</label>
		</li>
	);
};

AccountDialogAccount.propTypes = {
	account: PropTypes.shape( {
		ID: PropTypes.oneOfType( [ React.PropTypes.number, React.PropTypes.string ] ),
		name: PropTypes.string,
		picture: PropTypes.string,
		keyringConnectionId: PropTypes.number,
		isConnected: PropTypes.bool,
		isExternal: PropTypes.bool
	} ).isRequired,
	selected: PropTypes.bool,
	conflicting: PropTypes.bool,
	onChange: PropTypes.func,
};

AccountDialogAccount.defaultProps = {
	conflicting: false,
	connected: false,
	onChange: () => {},
	selected: false,
};

export default AccountDialogAccount;
