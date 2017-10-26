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

	getTokenValue = token => {
		if ( 'object' === typeof token ) {
			return token.name;
		}

		return token;
	};

	getIndexOfInput = () => {
		return this.props.value.length;
	};

	isInputEmpty = () => {
		return this.props.currentSearch.length === 0;
	};

	deleteToken = token => {
		const newTokens = filter( this.props.value, item => item.name !== token );
		this.props.onChange( newTokens );
	};

	onTokenClickRemove = event => {
		this.deleteToken( event.value );
	};

	onInputChange = event => {
		const text = event.value;
		this.props.onInputChange( text );
	};

	onKeyDown = event => {
		let preventDefault = false;

		switch ( event.keyCode ) {
			case 8: // backspace (delete to left)
				preventDefault = this.handleDeleteKey();
				break;
			case 27: // escape
				preventDefault = this.handleEscapeKey();
			default:
				break;
		}

		if ( preventDefault ) {
			event.preventDefault();
		}
	};

	handleDeleteKey = () => {
		let preventDefault = false;

		if ( this.props.hasFocus && this.isInputEmpty() ) {
			const index = this.getIndexOfInput() - 1;
			if ( index > -1 ) {
				this.deleteToken( get( this.props.value, `[${ index }].name` ) );
			}
			preventDefault = true;
		}

		return preventDefault;
	};

	handleEscapeKey = () => {
		let preventDefault = false;
		if ( this.props.hasFocus && ! this.isInputEmpty() ) {
			this.props.onInputChange( '' );
			this.props.onBlur();
			preventDefault = true;
		}
		return preventDefault;
	};

	renderTokensAndInput = () => {
		const components = map( this.props.value, this.renderToken );

		components.splice( this.getIndexOfInput(), 0, this.renderInput() );

		return components;
	};

	renderToken = token => {
		const value = this.getTokenValue( token );

		return (
			<Token
				key={ 'token-' + value }
				value={ value }
				displayTransform={ identity }
				tooltip={ token.tooltip }
				onClickRemove={ this.onTokenClickRemove }
				isBorderless={ token.isBorderless || this.props.isBorderless }
				disabled={ 'error' !== status && this.props.disabled }
			/>
		);
	};

	renderInput = () => {
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
			props = { ...props, onChange: this.onInputChange };
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
			props.onKeyDown = this.onKeyDown;
		}
		return <div { ...props }>{ this.renderTokensAndInput() }</div>;
	}
}

export default localize( ProductSearchField );
