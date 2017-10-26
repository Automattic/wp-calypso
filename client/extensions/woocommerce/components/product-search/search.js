/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { filter, identity, map } from 'lodash';
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
			onBlur,
			maxLength,
			value,
			placeholder,
		} = this.props;

		let props = {
			id,
			disabled,
			key: 'input',
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

		return <TokenInput { ...props } />;
	};

	render() {
		return <div className="product-search__input-container">{ this._renderTokensAndInput() }</div>;
	}
}

export default localize( ProductSearchField );
