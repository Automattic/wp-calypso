/**
 * External dependencies
 */
import classNames from 'classnames';
import React from 'react';

class FormSelect extends React.Component {
	static defaultProps = {
		isError: false,
	};

	render() {
		const { inputRef, className, isError, ...props } = this.props;
		const classes = classNames( className, 'form-select', {
			'is-error': isError,
		} );

		return (
			<select { ...props } ref={ inputRef } className={ classes }>
				{ this.props.children }
			</select>
		);
	}
}

export default FormSelect;
