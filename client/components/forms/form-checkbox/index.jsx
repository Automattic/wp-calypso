/** @format */
/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

export default class FormInputCheckbox extends React.Component {
	setInputRef = element => {
		this.input = element;
	}

	updateIndeterminateState() {
		const indeterminate = !! this.props.indeterminate;
		if ( this.input && this.input.indeterminate !== indeterminate ) {
			this.input.indeterminate = indeterminate;
		}
	}

	componentDidMount() {
		this.updateIndeterminateState();
	}

	componentDidUpdate() {
		this.updateIndeterminateState();
	}

	render() {
		const { className, indeterminate, ...otherProps } = this.props;

		const classes = classnames( 'form-checkbox', className, {
			'is-indeterminate': indeterminate,
		} );

		return (
			<input
				{ ...otherProps }
				type="checkbox"
				className={ classes }
				ref={ this.setInputRef }
			/>
		);
	}
}
