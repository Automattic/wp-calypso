import * as chrono from 'chrono-node';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { withLocalizedMoment } from 'calypso/components/localized-moment';

import './style.scss';

class InputChrono extends Component {
	static propTypes = {
		value: PropTypes.string,
		onSet: PropTypes.func,
		placeholder: PropTypes.string,
	};

	static defaultProps = {
		value: '',
		placeholder: '',
		onSet: () => {},
	};

	state = {
		value: this.props.value,
	};

	focused = false;

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( ! this.focused && this.props.value !== nextProps.value ) {
			this.setState( { value: nextProps.value } );
		}
	}

	handleChange = ( event ) => {
		this.setState( { value: event.target.value } );
	};

	handleBlur = ( event ) => {
		this.setDateText( event );
		this.focused = false;
	};

	handleFocus = () => {
		this.focused = true;
	};

	onKeyDown = ( event ) => {
		if ( 13 !== event.keyCode ) {
			return;
		}

		this.setDateText( event );
	};

	setDateText = ( event ) => {
		const date = chrono[ this.props.locale ].parseDate( event.target.value );

		if ( date ) {
			this.setState( { value: this.props.moment( date ).calendar() } );
			this.props.onSet( this.props.moment( date ) );
		}
	};

	isLangSupported = ( lang ) => {
		return !! chrono[ lang ]; // is there an export like `chrono.de` or `chrono.ja`?
	};

	render() {
		return (
			<div className="input-chrono">
				{ this.isLangSupported( this.props.locale ) ? (
					<input
						className="input-chrono__input"
						value={ this.state.value }
						placeholder={ this.props.placeholder }
						onKeyDown={ this.onKeyDown }
						onChange={ this.handleChange }
						onFocus={ this.handleFocus }
						onBlur={ this.handleBlur }
					/>
				) : (
					<div className="input-chrono__text">{ this.state.value }</div>
				) }
			</div>
		);
	}
}

export default localize( withLocalizedMoment( InputChrono ) );
