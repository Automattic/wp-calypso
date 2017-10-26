/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { filter, get, identity, map } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Token from 'components/token-field/token';
import TokenInput from 'components/token-field/token-input';

class ProductSearchField extends Component {
	static propTypes = {
		disabled: PropTypes.bool,
		isBorderless: PropTypes.bool,
		onChange: PropTypes.func,
		onInputChange: PropTypes.func,
		value: PropTypes.array,
	};

	_getTokenValue = token => {
		if ( 'object' === typeof token ) {
			return token.name;
		}

		return token;
	};

	_getIndexOfInput = () => {
		return this.props.value.length;
	};

	_isInputEmpty = () => {
		return this.props.currentSearch.length === 0;
	};

	_deleteToken = token => {
		const newTokens = filter( this.props.value, item => item.name !== token );
		this.props.onChange( newTokens );
	};

	_onTokenClickRemove = event => {
		this._deleteToken( event.value );
	};

	_onInputChange = event => {
		const text = event.value;
		this.props.onInputChange( text );
	};

	_onKeyDown = event => {
		let preventDefault = false;

		switch ( event.keyCode ) {
			case 8: // backspace (delete to left)
				preventDefault = this._handleDeleteKey();
				break;
			case 27: // escape
				preventDefault = this._handleEscapeKey();
			default:
				break;
		}

		if ( preventDefault ) {
			event.preventDefault();
		}
	};

	_handleDeleteKey = () => {
		let preventDefault = false;

		if ( this.props.hasFocus && this._isInputEmpty() ) {
			const index = this._getIndexOfInput() - 1;
			if ( index > -1 ) {
				this._deleteToken( get( this.props.value, `[${ index }].name` ) );
			}
			preventDefault = true;
		}

		return preventDefault;
	};

	_handleEscapeKey = () => {
		let preventDefault = false;
		if ( this.props.hasFocus && ! this._isInputEmpty() ) {
			this.props.onInputChange( '' );
			this.props.onBlur();
			preventDefault = true;
		}
		return preventDefault;
	};

	_renderTokensAndInput = () => {
		const components = map( this.props.value, this._renderToken );

		components.splice( this._getIndexOfInput(), 0, this._renderInput() );

		return components;
	};

	_renderToken = token => {
		const value = this._getTokenValue( token );

		return (
			<Token
				key={ 'token-' + value }
				value={ value }
				displayTransform={ identity }
				tooltip={ token.tooltip }
				onClickRemove={ this._onTokenClickRemove }
				isBorderless={ token.isBorderless || this.props.isBorderless }
				disabled={ 'error' !== status && this.props.disabled }
			/>
		);
	};

	_renderInput = () => {
		const {
			currentSearch,
			disabled,
			hasFocus,
			id,
			maxLength,
			onBlur,
			placeholder,
			value,
		} = this.props;

		let props = {
			id,
			disabled,
			hasFocus,
			onBlur,
			value: currentSearch,
		};

		if ( value.length === 0 && placeholder ) {
			props.placeholder = placeholder;
		}

		if ( ! ( maxLength && value.length >= maxLength ) ) {
			props = { ...props, onChange: this._onInputChange };
		}

		return <TokenInput key="input" { ...props } />;
	};

	render() {
		const props = {
			className: 'product-search__input-container',
		};
		if ( ! this.props.disabled ) {
			props.tabIndex = '-1';
			props.onFocus = this.props.onFocus;
			props.onKeyDown = this._onKeyDown;
		}
		return <div { ...props }>{ this._renderTokensAndInput() }</div>;
	}
}

export default localize( ProductSearchField );
