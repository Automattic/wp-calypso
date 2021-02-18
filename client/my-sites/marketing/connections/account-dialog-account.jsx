/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import FormLabel from 'calypso/components/forms/form-label';
import FormRadio from 'calypso/components/forms/form-radio';
import Gridicon from 'calypso/components/gridicon';
import Image from 'calypso/components/image';

/**
 * Style dependencies
 */
import './account-dialog-account.scss';

const AccountDialogAccount = ( { account, conflicting, onChange, selected, defaultIcon } ) => {
	const classes = classNames( 'account-dialog-account', {
		'is-connected': account.isConnected,
		'is-conflict': conflicting,
	} );

	return (
		<li className={ classes }>
			<FormLabel className="account-dialog-account__label">
				{ conflicting && <Gridicon icon="notice" /> }
				{ ! account.isConnected && (
					<FormRadio
						onChange={ onChange }
						checked={ selected }
						className="account-dialog-account__input"
					/>
				) }
				{ account.picture ? (
					<Image
						src={ account.picture }
						alt={ account.name }
						className="account-dialog-account__picture"
					/>
				) : (
					<Gridicon icon={ defaultIcon } className="account-dialog-account__picture" />
				) }
				<span className="account-dialog-account__content">
					<div className="account-dialog-account__name">{ account.name }</div>
					{ account.description && (
						<div className="account-dialog-account__description">{ account.description }</div>
					) }
				</span>
			</FormLabel>
		</li>
	);
};

AccountDialogAccount.propTypes = {
	account: PropTypes.shape( {
		ID: PropTypes.oneOfType( [ PropTypes.number, PropTypes.string ] ),
		name: PropTypes.string,
		picture: PropTypes.string,
		keyringConnectionId: PropTypes.number,
		isConnected: PropTypes.bool,
		isExternal: PropTypes.bool,
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
