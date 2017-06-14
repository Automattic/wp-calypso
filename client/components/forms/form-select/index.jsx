/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

const FormSelect = React.createClass( {
	getDefaultProps() {
		return {
			isError: false,
		};
	},

	render() {
		const { inputRef, className, isError, ...props } = this.props;
		const classes = classNames( className, 'form-select', {
			'is-error': isError,
		} );

		const ref = inputRef ? { ref: inputRef } : {};

		return (
			<select { ...props } { ...ref } className={ classes }>
				{ this.props.children }
			</select>
		);
	}
} );

export default FormSelect;
