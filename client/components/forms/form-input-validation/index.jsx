/**
 * External dependencies
 */
import React from 'react/addons';
import classNames from 'classnames';

module.exports = React.createClass( {

	displayName: 'FormInputValidation',

	getDefaultProps() {
		return { isError: false };
	},

	render() {
		const classes = classNames( {
			'form-input-validation': true,
			'is-error': this.props.isError
		} );

		return (
			<div className={ classes }>
				<span>{ this.props.text }</span>
			</div>
		);
	}
} );
