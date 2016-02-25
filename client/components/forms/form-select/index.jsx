/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import omit from 'lodash/omit';

const FormSelect = React.createClass( {
	getDefaultProps() {
		return {
			isError: false,
		};
	},

	render() {
		const classes = classNames( this.props.className, 'form-select', {
			'is-error': this.props.isError,
		} );

		return (
			<select { ...omit( this.props, 'className' ) } className={ classes } >
				{ this.props.children }
			</select>
		);
	}
} );

export default FormSelect;
