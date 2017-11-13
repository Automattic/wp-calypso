/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import chrono from 'chrono-node';

/**
 * Supported languages
 */
const supportedLanguages = [ 'en', 'jp' ];

class InputChrono extends React.Component {
	static displayName = 'InputChrono';

	static propTypes = {
		value: PropTypes.string,
		lang: PropTypes.string,
		onSet: PropTypes.func,
		placeholder: PropTypes.string,
	};

	static defaultProps = {
		value: '',
		lang: '',
		placeholder: '',
		onSet: () => {},
	};

	state = {
		value: this.props.value,
	};

	focused = false;

	componentWillReceiveProps( nextProps ) {
		if ( ! this.focused && this.props.value !== nextProps.value ) {
			this.setState( { value: nextProps.value } );
		}
	}

	handleChange = event => {
		this.setState( { value: event.target.value } );
	};

	handleBlur = event => {
		this.setDateText( event );
		this.focused = false;
	};

	handleFocus = () => {
		this.focused = true;
	};

	onKeyDown = event => {
		if ( 13 !== event.keyCode ) {
			return;
		}

		this.setDateText( event );
	};

	setDateText = event => {
		var date = chrono.parseDate( event.target.value );

		if ( date ) {
			this.setState( { value: this.props.moment( date ).calendar() } );
			this.props.onSet( this.props.moment( date ) );
		}
	};

	isLangSupported = lang => {
		return supportedLanguages.indexOf( lang ) >= 0;
	};

	render() {
		return (
			<div className="input-chrono__container">
				{ this.isLangSupported( this.props.lang ) ? (
					<input
						className="input-chrono"
						value={ this.state.value }
						placeholder={ this.props.placeholder }
						onKeyDown={ this.onKeyDown }
						onChange={ this.handleChange }
						onFocus={ this.handleFocus }
						onBlur={ this.handleBlur }
					/>
				) : (
					<div className="text-chrono">{ this.state.value }</div>
				) }
			</div>
		);
	}
}

export default localize( InputChrono );
