/**
 * External dependencies
 */
import React from 'react';
import chrono from 'chrono-node';

/**
 * Supported languages
 */
const supportedLanguages = [ 'en', 'jp' ];

export default React.createClass( {
	displayName: 'InputChrono',

	focused: false,

	propTypes: {
		value: React.PropTypes.string,
		lang: React.PropTypes.string,
		onSet: React.PropTypes.func,
		placeholder: React.PropTypes.string
	},

	getDefaultProps() {
		return {
			value: '',
			lang: '',
			placeholder: '',
			onSet: () => {}
		};
	},

	getInitialState() {
		return {
			value: this.props.value
		};
	},

	componentWillReceiveProps( nextProps ) {
		if ( ! this.focused && this.props.value !== nextProps.value ) {
			this.setState( { value: nextProps.value } );
		}
	},

	handleChange( event ) {
		this.setState( { value: event.target.value } );
	},

	handleBlur( event ) {
		this.setDateText( event );
		this.focused = false;
	},

	handleFocus() {
		this.focused = true;
	},

	onKeyDown( event ) {
		if ( 13 !== event.keyCode ) {
			return;
		}

		this.setDateText( event );
	},

	setDateText( event ) {
		const date = chrono.parseDate( event.target.value );

		if ( date ) {
			this.setState( { value: this.moment( date ).calendar() } );
			this.props.onSet( this.moment( date ) );
		}
	},

	isLangSupported( lang ) {
		return supportedLanguages.indexOf( lang ) >= 0;
	},

	render() {
		return (
			<div className="input-chrono__container" >
				{ this.isLangSupported( this.props.lang ) ?
					<input
						className="input-chrono"
						value={ this.state.value }
						placeholder={ this.props.placeholder }
						onKeyDown={ this.onKeyDown }
						onChange={ this.handleChange }
						onFocus={ this.handleFocus }
						onBlur={ this.handleBlur } /> :
					<div className="text-chrono">
						{ this.state.value }
					</div>
				}
			</div>
		);
	}
} );

