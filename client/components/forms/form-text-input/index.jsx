/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

export default React.createClass( {

	displayName: 'FormTextInput',

	getDefaultProps() {
		return {
			isError: false,
			isValid: false,
			selectOnFocus: false,
			type: 'text'
		};
	},

	focus() {
		this.refs.textField.focus();
	},

	render() {
		const { className, selectOnFocus } = this.props;
		const classes = classNames( className, {
			'form-text-input': true,
			'is-error': this.props.isError,
			'is-valid': this.props.isValid
		} );

		return (
			<input
				{ ...this.props }
				ref="textField"
				className={ classes }
				onClick={ selectOnFocus ? this.selectOnFocus : null } />
		);
	},

	selectOnFocus( event ) {
		event.target.select();
	}

} );
