import clsx from 'clsx';
import { Component } from 'react';
import type { LegacyRef, HTMLProps } from 'react';

import './style.scss';

export interface FormSelectProps {
	inputRef?: LegacyRef< HTMLSelectElement >;
	className?: string;
	isError?: boolean;
}

class FormSelect extends Component<
	FormSelectProps & Omit< HTMLProps< HTMLSelectElement >, 'ref' >
> {
	static defaultProps = {
		isError: false,
	};

	render() {
		const { inputRef, className, isError, ...props } = this.props;
		const classes = clsx( className, 'form-select', {
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
