/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import Gridicon from 'gridicons';

export default class AccountDialogAccount extends Component {
	static propTypes = {
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

	static defaultProps = {
		conflicting: false,
		connected: false,
		onChange: () => {},
		selected: false,
	};

	getPictureElement() {
		if ( this.props.account.picture ) {
			return <img
				src={ this.props.account.picture }
				alt={ this.props.account.name }
				className="account-dialog-account__picture" />;
		}
	}

	getRadioElement() {
		if ( ! this.props.account.isConnected ) {
			return <input
				type="radio"
				onChange={ this.props.onChange }
				checked={ this.props.selected }
				className="account-dialog-account__input" />;
		}
	}

	render() {
		const classes = classNames( 'account-dialog-account', {
			'is-connected': this.props.account.isConnected,
			'is-conflict': this.props.conflicting,
		} );

		return (
			<li className={ classes }>
				<label className="account-dialog-account__label">
					{ this.props.conflicting && <Gridicon icon="notice" /> }
					{ this.getRadioElement() }
					{ this.getPictureElement() }
					<span className="account-dialog-account__name">{ this.props.account.name }</span>
				</label>
			</li>
		);
	}
}
